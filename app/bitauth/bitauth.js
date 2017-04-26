'use strict';

angular.module('playApp.bitauth', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/bitauth', {
    templateUrl: 'bitauth/bitauth.html',
    controller: 'BitauthCtrl'
  });
}])

.controller('BitauthCtrl', function($scope, $rootScope, $http, bitcore) {

  $scope.bitcoreURL = 'https://github.com/bitauth/bitauth2017';
  $scope.bitcoinURL = 'https://github.com/bitauth/bitauth2017/blob/master/bips/0-bitauth.mediawiki';
  var explorers = require('bitcore-explorers-dash');
  var defaultLivenetAddress = 'Xx93S4aEAvk4sc7a7mV2DH4xgSrpNv73np';
  var defaultTestnetAddress = 'yXPhYThbvYuLx95og45hYMQzkSNwyRs7Ta';
  var _ = bitcore.deps._;

  $scope.$on('networkUpdate', function() {
    reset();
  });

  var reset = function() {
    if (bitcore.Networks.defaultNetwork.name === 'testnet') {
      $scope.utxoAddress = defaultTestnetAddress;
    } else {
      $scope.utxoAddress = defaultLivenetAddress;
    }
    $scope.utxos = [];
    $scope.loading = false;
    $scope.loading2 = false;
    $scope.currentAddress = '';
    $rootScope.transaction = new bitcore.Transaction();
    $scope.privateKey = '';
    $scope.authhead = '';
    $scope.authheadAddress = '';
    $scope.authheadchain = [];

    $scope.fromAddresses = [];
    $rootScope.toAddresses = {};
    $rootScope.addData = [];
    $rootScope.privateKeys = [];
    $scope.change = '';
    $scope.loading = false;
    $scope.loading2 = false;
    setExampleCode();
  };
  reset();

  $scope.privateKey = '';
  $scope.authhead = '';
  $scope.authheadAddress = '';
  $scope.authheadchain = [];

  $scope.fromAddresses = [];
  $rootScope.toAddresses = {};
  $rootScope.addData = [];
  $rootScope.privateKeys = [];
  $scope.change = '';
  $scope.nLockTime = undefined;
  $scope.loading = false;
  $scope.loading2 = false;

  $scope.$watch('nLockTime', function(newValue) {
    if (!newValue) {
      $scope.currentAddress = undefined;
    } else {
      $rootScope.transaction.nLockTime = newValue;
    }
    setExampleCode();
  });

  $scope.utxos = [];

  $scope.fetchUTXO = function(address) {
      var client;
      if (bitcore.Networks.defaultNetwork.name === 'testnet') {
          client = new explorers.Insight('https://dev-test.dash.org:3001', bitcore.Networks.defaultNetwork.name);
      } else {
          client = new explorers.Insight('https://insight.dash.org:3001', bitcore.Networks.defaultNetwork.name);
      }
    if (!bitcore.Address.isValid(address)) return; // mark as invalid
    
    $scope.loading = true;
    client.getUtxos(address, onUTXOs);

    $scope.fromAddresses.push(address);

    function onUTXOs(err, utxos) {
      $scope.loading = false;
      if (err) throw err;

      if (!utxos.length) {
        $scope.utxos = [];
        $scope.notFound = address;
        $scope.currentAddress = '';
        $scope.$apply();
        return;
      }

      $scope.utxos = utxos;
      $scope.currentAddress = address;
      $scope.$apply();
      console.log(utxos);
    }
  };

    $scope.resolveAuthhead = function(authbase) {
        var client;
        if (bitcore.Networks.defaultNetwork.name === 'testnet') {
            client = new explorers.Insight('https://dev-test.dash.org:3001', bitcore.Networks.defaultNetwork.name);
        } else {
            client = new explorers.Insight('https://insight.dash.org:3001', bitcore.Networks.defaultNetwork.name);
        }
        //if (!bitcore.Address.isValid(address)) return; // mark as invalid

        $scope.loading2 = true;
        $scope.authheadchain.push(authbase);

        client.getTransaction(authbase, onTx);

        function onTx(err, tx) {
            $scope.loading2 = false;
            if (err) throw err;
            var spentTxId = tx.vout[0].spentTxId;
            console.log('spentTxId: ' + spentTxId);
            if (spentTxId !== null) {
                $scope.resolveAuthhead(spentTxId);
            } else {
                $scope.authhead = authbase;
                console.log('your authbase is: ' + $scope.authbase);
                console.log('your current authhead is: ' + $scope.authhead);
                $scope.authheadtext = 'your current authhead is: ' + $scope.authhead;
                $scope.$apply();
                return;
            }
        }
    };

  $scope.signWith = function(privKey) {
    try {
      $('#addSignatureModal').foundation('reveal', 'close');
      if (!privKey) {
        return;
      }
      var privateKey = new bitcore.PrivateKey(privKey);
      $rootScope.privateKeys.push(privateKey);
      var signatures = $rootScope.transaction.getSignatures(privateKey);
      if (!signatures.length) {
        $('#noSignatures').foundation('reveal', 'open');
      } else {
        $rootScope.transaction.sign(privateKey);
      }
      setExampleCode();
    } catch (e) {
      console.log('Error', e);
    }
  };

  $scope.addUTXO = function(utxo) {
    utxo.used = true;
    $rootScope.transaction.from(utxo);
    setExampleCode();
  };

  $scope.removeUtxo = function(utxo) {
    var txId = utxo.txId.toString('hex');
    $rootScope.transaction.removeInput(txId, utxo.outputIndex);
    for (var i in $scope.utxos) {
      if ($scope.utxos[i].txId.toString('hex') === txId && $scope.utxos[i].outputIndex === utxo.outputIndex) {
        $scope.utxos[i].used = false;
      }
    }
    setExampleCode();
  };
  $scope.removeInput = function(input) {
    $scope.removeUtxo({txId: input.prevTxId, outputIndex: input.outputIndex});
  };
  $scope.removeOutput = function(index) {
    $rootScope.transaction.removeOutput(index);
    setExampleCode();
    $scope.$apply();
  };

  $scope.addAddressOutput = function(address, amount) {
    console.log(address, amount);
    $('#addP2PKHorP2SHModal').foundation('reveal', 'close');
    if (!amount && amount !== 0) {
      return;
    }
    amount = bitcore.Unit.fromBTC(amount).toSatoshis();
    $rootScope.toAddresses[address] = amount;
    $rootScope.transaction.to(address, amount);
    setExampleCode();
    if (!$('#identityoutput').prop('disabled') && $('#signatureoutput').prop('disabled')) {
        $('#identityoutput').prop("disabled",true);
        $('#signatureoutput').prop("disabled",false);
        $('#opreturnoutput').prop("disabled",false);
    }

  };

  $rootScope.addDataOutput = function(info) {
    $('#addDataModal').foundation('reveal', 'close');
    $rootScope.addData.push(info);
    $rootScope.transaction.addData(info);
    setExampleCode();
    // op_return output is the last one, so disable outputs
      $('#identityoutput').prop("disabled",true);
      $('#signatureoutput').prop("disabled",true);
      $('#opreturnoutput').prop("disabled",true);
  };

  $scope.addPrivateKey = function(privKey) {
    $rootScope.privateKeys.push(privKey);
    setExampleCode();
  };

  $scope.canSerialize = function() {
    try {
      $rootScope.transaction.serialize();
    } catch (err) {
      return false;
    }
    return $rootScope.transaction.inputs.length > 0;
  }

  $scope.broadcast = function() {
    var serialized = $rootScope.transaction.serialize();
      var client;
      if (bitcore.Networks.defaultNetwork.name === 'testnet') {
          client = new explorers.Insight('https://dev-test.dash.org:3001', bitcore.Networks.defaultNetwork.name);
      } else {
          client = new explorers.Insight('https://insight.dash.org:3001', bitcore.Networks.defaultNetwork.name);
      }
    $scope.broadcasting = true;
    client.broadcast(serialized, function(err, id) {
      $scope.broadcasting = false;
      if (err) {
        $('#broadcastError').foundation('reveal', 'open');
      } else {
        $rootScope.transactionUrl = client.url + '/tx/' + $rootScope.transaction.id;
        $scope.$apply();
        $('#broadcastSuccess').foundation('reveal', 'open');
      }
    });
  };

  function setExampleCode() {
    var template = "";
    var i;

    template += "var transaction = new bitcore.Transaction()\n";
    for (i in $scope.utxos) {
      if ($scope.utxos[i].used) {
        template += "    .from(" + JSON.stringify($scope.utxos[i]) + ")\n";
      }
    }
    for (i in $rootScope.toAddresses) {
      template += "    .to('" + i + "', " + $rootScope.toAddresses[i] + ")\n";
    }
    for (i in $rootScope.addData) {
      template += "    .addData('" + $rootScope.addData[i] + "')\n";
    }
    for (i in $rootScope.privateKeys) {
      template += "    .sign('" + $rootScope.privateKeys[i] + "')\n";
    }
    if ($scope.change) {
      template += "    .change('" + $scope.change + "')\n";
    }
    if (!_.isUndefined($scope.nLockTime)) {
      template += "transaction.nLockTime = " + $scope.nLockTime + ";\n";
    }

    $scope.exampleCode = template;
  }

  $scope.jumpConsole = function() {
    $('#terminaltab').click();
    window.REPL.console.SetPromptText($scope.exampleCode);
    window.REPL.scrollToBottom();
  };

  $scope.getAddress = function(output) {
    return output.script.isScriptHashOut() || output.script.isPublicKeyHashOut()
    ? output.script.toAddress().toString()
    : '';
  }

  function initialExample() {
    var template = "";

    template += "var transaction = new bitcore.Transaction()\n";
    template += "    .from(utxos)\n";
    template += "    .to('1bitcoinAddress...', 10000)\n";
    template += "    .to('2bitcoinAddress...', 10000)\n";
    template += "    .change('3bitcoinAddress...', 20000);";

    $scope.exampleCode = template;
  }

  initialExample();

    function setupKeys() {
        $scope.keys = [1,2,3].map(getRandomKey);
        $scope.totalKeys = $scope.keys.length;
        $scope.threshold = 2;
    }

  // Monkey patching until next bitcore version is released
  bitcore.Transaction.prototype.removeInput = function(txId, outputIndex) {
    var index;
    if (!outputIndex && _.isNumber(txId)) {
      index = txId;
    } else {
      index = _.findIndex(this.inputs, function(input) {
        return input.prevTxId.toString('hex') === txId && input.outputIndex === outputIndex;
      });
    }
    if (index < 0 || index >= this.inputs.length) {
      throw new errors.Transaction.InvalidIndex(index, this.inputs.length);
    }
    var input = this.inputs[index];
    this._inputAmount -= input.output.satoshis;
    this.inputs = _.without(this.inputs, input);
    this._updateChangeOutput();
  };

    $scope.totalKeysRange = function() {
        var size = Math.max($scope.keys.length, 7);
        return Range(size);
    };

    $scope.signaturesRange = function() {
        return Range($scope.keys.length);
    };

    function Range(size) {
        var result = [];
        for (var i = 1; i <= size; i++) {
            result.push(i);
        }
        return result;
    }
    $scope.addMultisigAddress = function(addr) {
        console.log('multisigaddr: ' + addr);
        //angular.element('#multisigmodalremove')[0].click();
        angular.element('#identityoutput')[0].click();
        $scope.toMultisigAddress = addr;
        console.log('click');
    };

    function setupKeys() {
        $scope.keys = [1,2,3].map(getRandomKey);
        $scope.totalKeys = $scope.keys.length;
        $scope.threshold = 2;
    }

    $scope.setKeyAmount = function(amount) {
        var delta =  amount - $scope.keys.length;
        if (delta > 0) {
            for (var i = 0; i < delta; i++) $scope.add();
        } else {
            for (var i = 0; i > delta; i--) $scope.keys = $scope.keys.slice(0, -1);
        }

        if ($scope.threshold > amount) {
            $scope.threshold = amount;
        }
    };

    // Initial Setup
    setupKeys();

    function getRandomKey() {
        var priv = new bitcore.PrivateKey();
        return {
            privKey: priv.toString(),
            pubKey: priv.publicKey.toString()
        };
    }

    $scope.add = function() {
        $scope.keys.push(getRandomKey());
        $scope.totalKeys = $scope.keys.length;
    };

    $scope.remove = function(index) {
        var newKeys = [];
        for (var key in $scope.keys) {
            if (key != index) {
                newKeys.push($scope.keys[key]);
            }
        }
        $scope.keys = newKeys;
        $scope.totalKeys = $scope.keys.length;
        $scope.threshold = Math.min($scope.threshold, $scope.totalKeys);
    };

    $scope.updatePriv = function(index) {
        var privKey = new bitcore.PrivateKey($scope.keys[index].privKey);
        $scope.keys[index].privKey = privKey.toBuffer().toString('hex');
        $scope.keys[index].pubKey = privKey.publicKey.toString();
        setAddress();
    };

    $scope.randPriv = function(index) {
        $scope.keys[index] = getRandomKey();
        $scope.updatePriv(index);
    };

    $scope.updatePub = function(index) {
        $scope.keys[index].privKey = '';
        $scope.keys[index].pubKey = new bitcore.PublicKey($scope.keys[index].pubKey).toString();
        setAddress();
    };

    var setAddress = function() {
        var pubkeys = [];
        for (var key in $scope.keys) {
            pubkeys.push($scope.keys[key].pubKey);
        }
        var address = new bitcore.Address(pubkeys, $scope.threshold);

        $scope.address = address.toString();
        setExampleCode(pubkeys, $scope.threshold);
    };



    setAddress();
    $scope.$watchCollection('keys', setAddress);
    $scope.$watch('threshold', setAddress);

    //TODO: resolve to latest authhead
    //1. insight-api-dash/tx/[:txid] where txid is authbase id or regtx (EVO)
    //2. extract addr of out[0] (getAddress(output)) and get utxo set (fetchUTXO(utxoAddress)) - if identity output not in utxo set then spent, get txid of spending tx
    //3. repeat from 1. until found out[0] in utxo set

});
