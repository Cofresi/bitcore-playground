'use strict';
var btcMath = require('bitcoin-math');
angular.module('playApp.units', ['ngRoute'])

.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.when('/units', {
      templateUrl: 'units/units.html',
      controller: 'UnitsCtrl'
    });
  }
])

.controller('UnitsCtrl', function($scope, $http, bitcore) {
  $scope.unit = {};
  $scope.currencies = [];
  $scope.currency = null;
  $scope.exampleCode = '';
  $scope.bitcoreURL = 'http://bitcore.io/guide/unit.html';
  $scope.bitcoinURL = 'https://bitcoin.org/en/developer-guide#plain-text';

  function setExampleCode(value, code, fiat) {
    var template;
    var templates = {
      BTC: 'var unit = new bitcore.Unit.fromBTC(@value);',
      mBTC: 'var unit = new bitcore.Unit.fromMilis(@value);',
      bits: 'var unit = new bitcore.Unit.fromBits(@value);',
      satoshis: 'var unit = new bitcore.Unit.fromSatoshis(@value);',
    };

    if (templates[code]) {
      template = templates[code].replace('@value', value);
      template += '\nvar rate = @rate; // @fiat/BTC exchange rate';
    } else {
      template = 'var rate = @rate; // @fiat/BTC exchange rate\n';
      template += 'var unit = new bitcore.Unit.fromFiat(@value, rate);';
    }
    template = template.replace('@value', value);
    template = template.replace('@rate', fiat && fiat.rate);
    template = template.replace('@fiat', fiat && fiat.code);

    var rate = $scope.currency ? $scope.currency.rate : 0;
    template += "\nconsole.log('Units', unit.BTC, unit.mBTC, unit.bits, unit.satoshis, unit.atRate(rate));";
    $scope.exampleCode = template;
  }

  $scope.jumpConsole = function() {
    $('#terminaltab').click();
    window.REPL.console.SetPromptText($scope.exampleCode);
    window.REPL.scrollToBottom();
  };

  $scope.updateUnit = function(value, code) {
    var unit = new bitcore.Unit(value, code);

    if (value === '' || isNaN(unit.satoshis)) {
      return; // TODO: mark as invalid
    }
    $scope.unit.BTC = unit.BTC;
    $scope.unit.mBTC = unit.mBTC;
    $scope.unit.bits = unit.bits;
    $scope.unit.satoshis = unit.satoshis;

    if (angular.isString(code)) {
      $scope.unit[code] = value;
      $scope.unit.fiat = $scope.currency ? unit.atRate($scope.currency.rate) : 0;
    }

    setExampleCode(value, code, $scope.currency);
  };

  $scope.updateFiat = function(value, rate) {
    $scope.updateUnit(value, rate.rate);
  };

  $scope.updateUnit(1, 'BTC');

  $http.get('http://138.197.42.185/').
  success(function(rates) {
    $scope.currencies = rates.filter(function(rate) {
      return rate.code === 'USD' ||
        rate.code === 'BTC' ||
        rate.code === 'EUR' ||
        rate.code === 'CHF' ||
        rate.code === 'ARS' ||
        rate.code === 'GBP' ||
        rate.code === 'JPY' ||
        rate.code === 'CAD' ||
        rate.code === 'AUD' ||
        rate.code === 'BRL' ||
        rate.code === 'RUB' ||
        rate.code === 'CNY' ||
        rate.code === 'SEK' ||
        rate.code === 'NZD' ||
        rate.code === 'KRW' ||
        rate.code === 'AED' ||
        rate.code === 'AFN' ||
        rate.code === 'ALL' ||
        rate.code === 'AMD' ||
        rate.code === 'ANG' ||
        rate.code === 'AZN' ||
        rate.code === 'BAM' ||
        rate.code === 'BBD' ||
        rate.code === 'BDT' ||
        rate.code === 'BGN' ||
        rate.code === 'BHD' ||
        rate.code === 'BIF' ||
        rate.code === 'BMD' ||
        rate.code === 'BND' ||
        rate.code === 'BOB' ||
        rate.code === 'BRL' ||
        rate.code === 'BSD' ||
        rate.code === 'BTN' ||
        rate.code === 'BWP' ||
        rate.code === 'BYR' ||
        rate.code === 'BZD' ||
        rate.code === 'CDF' ||
        rate.code === 'CLF' ||
        rate.code === 'CLP' ||
        rate.code === 'COP' ||
        rate.code === 'CZK' ||
        rate.code === 'DJF' ||
        rate.code === 'DKK' ||
        rate.code === 'DOP' ||
        rate.code === 'DZD' ||
        rate.code === 'EGP' ||
        rate.code === 'ETB' ||
        rate.code === 'FJD' ||
        rate.code === 'FKP' ||
        rate.code === 'GEL' ||
        rate.code === 'GHS' ||
        rate.code === 'GIP' ||
        rate.code === 'GMD' ||
        rate.code === 'GNF' ||
        rate.code === 'GTQ' ||
        rate.code === 'HRK' ||
        rate.code === 'HTG' ||
        rate.code === 'HUF' ||
        rate.code === 'IDR' ||
        rate.code === 'ILS' ||
        rate.code === 'INR' ||
        rate.code === 'JMD' ||
        rate.code === 'JOD' ||
        rate.code === 'KES' ||
        rate.code === 'KGS' ||
        rate.code === 'KHR' ||
        rate.code === 'KMF' ||
        rate.code === 'KPW' ||
        rate.code === 'KWD' ||
        rate.code === 'KYD' ||
        rate.code === 'LKR' ||
        rate.code === 'LRD' ||
        rate.code === 'LSL' ||
        rate.code === 'LTL' ||
        rate.code === 'LVL' ||
        rate.code === 'LYD' ||
        rate.code === 'MAD' ||
        rate.code === 'MDL' ||
        rate.code === 'MGA' ||
        rate.code === 'MKD' ||
        rate.code === 'MMK' ||
        rate.code === 'MNT' ||
        rate.code === 'MOP' ||
        rate.code === 'MRO' ||
        rate.code === 'MUR' ||
        rate.code === 'MVR' ||
        rate.code === 'MWK' ||
        rate.code === 'MXN' ||
        rate.code === 'MYR' ||
        rate.code === 'MZN' ||
        rate.code === 'NAD' ||
        rate.code === 'NGN' ||
        rate.code === 'NIO' ||
        rate.code === 'NOK' ||
        rate.code === 'NPR' ||
        rate.code === 'OMR' ||
        rate.code === 'PAB' ||
        rate.code === 'PKR' ||
        rate.code === 'PLN' ||
        rate.code === 'PYG' ||
        rate.code === 'QAR' ||
        rate.code === 'RON' ||
        rate.code === 'RSD' ||
        rate.code === 'SCR' ||
        rate.code === 'SDG' ||
        rate.code === 'SGD' ||
        rate.code === 'SHP' ||
        rate.code === 'SLL' ||
        rate.code === 'SOS' ||
        rate.code === 'SRD' ||
        rate.code === 'STD' ||
        rate.code === 'SVC' ||
        rate.code === 'SYP' ||
        rate.code === 'SZL' ||
        rate.code === 'THB' ||
        rate.code === 'TJS' ||
        rate.code === 'TMT' ||
        rate.code === 'TND' ||
        rate.code === 'TOP' ||
        rate.code === 'TRY' ||
        rate.code === 'TTD' ||
        rate.code === 'TWD' ||
        rate.code === 'TZS' ||
        rate.code === 'UAH' ||
        rate.code === 'UGX' ||
        rate.code === 'UYU' ||
        rate.code === 'UZS' ||
        rate.code === 'VEF' ||
        rate.code === 'VND' ||
        rate.code === 'VUV' ||
        rate.code === 'WST' ||
        rate.code === 'XAF' ||
        rate.code === 'XAG' ||
        rate.code === 'XAU' ||
        rate.code === 'XCD' ||
        rate.code === 'XOF' ||
        rate.code === 'XPF' ||
        rate.code === 'YER' ||
        rate.code === 'ZAR' ||
        rate.code === 'ZMW' ||
        rate.code === 'ZWL';

    });
    $scope.currency = rates[0];
    $scope.updateUnit(1, 'BTC');
  }).
  error(function() {
    console.log('Error while fetching exchange rates');
  });
});
