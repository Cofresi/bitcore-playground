'use strict';

angular.module('playApp.unspent', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/unspent', {
    templateUrl: 'unspent/unspent.html',
    controller: 'UnspentCtrl'
  });
}])

.controller('UnspentCtrl', function($scope, $http, bitcore) {

  var explorers = require('bitcore-explorers-dash');

  var defaultLivenetAddress = 'Xx93S4aEAvk4sc7a7mV2DH4xgSrpNv73np';
  var defaultTestnetAddress = 'yfDmZYuLJAx3tuJYwie36xWXz15NWdUPfM';
  $scope.bitcoreURL = 'http://bitcore.io/guide/module/explorers/index.html';
  $scope.bitcoinURL = 'https://bitcoin.org/en/developer-guide#term-output';

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
    $scope.currentAddress = '';
    setExampleCode();
  };
  reset();

  $scope.addressUpdated = function(address) {
    setExampleCode();
  };

  $scope.$watch('utxoAddress', function() {
    $scope.notFound = '';
  });

  $scope.fetchUTXO = function(address) {
    var client;
      if (bitcore.Networks.defaultNetwork.name === 'testnet') {
          client = new explorers.Insight('https://dev-test.dash.org:3001', bitcore.Networks.defaultNetwork.name);
      } else {
          client = new explorers.Insight('https://insight.dash.org:3001', bitcore.Networks.defaultNetwork.name);
      }

    if (!bitcore.Address.isValid(address)) {
      return; // mark as invalid
    }

    $scope.loading = true;
    $scope.notFound = false;
    client.getUtxos(address, onUTXOs);

    function onUTXOs(err, utxos) {
      $scope.loading = false;
      if (err) throw err;

      if (!utxos.length) {
        $scope.utxos = [];
        $scope.notFound = true;
        $scope.currentAddress = '';
        $scope.$apply();
        return;
      }

      $scope.currentAddress = address;
      $scope.utxos = utxos;
      for (var utxo in utxos) {
        utxos[utxo].url = client.url + '/tx/' + utxos[utxo].txId;
        utxos[utxo].txUrl = 'transaction/';
      }
      $scope.$apply();
    }
  };

  function setExampleCode() {
    var template = "";
    var address = $scope.utxoAddress || '1BitcoinEaterAddressDontSendf59kuE';

    template += "var explorers = require('bitcore-explorers-dash');\n";
    template += "var client = new explorers.Insight();\n";
    template += "client.getUnspentUtxos('" + address + "', function(err, utxos) {\n";
    template += "    UTXOs = utxos;\n";
    template += "    console.log('UTXOs:', utxos);\n";
    template += "});";

    $scope.exampleCode = template;
  }

  $scope.jumpConsole = function() {
    $('#terminaltab').click();
    window.REPL.console.SetPromptText($scope.exampleCode);
    window.REPL.scrollToBottom();
  };

  setExampleCode();

});
