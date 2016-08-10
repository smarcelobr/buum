'use strict';

angular.module('desarmaBomba', ['ngRoute'])
.config(['$routeProvider',function($routeProvider) {
   	$routeProvider
   		.when('/instrucoes',{templateUrl:'instrucoes.html'})
   		.when('/:seqCodigo?',{templateUrl:'desarmabomba.html'})
   		.otherwise({redirectTo:'/'});
}])
.config(['$locationProvider',function($locationProvider) {
	$locationProvider.html5Mode(true);
}])
.controller('DesarmaBombaCtrl', ['$scope','$routeParams','$location','$route','$window',
	function ($scope,$routeParams,$location,$route,$window) {

	var seqCodigo = $routeParams.seqCodigo;

	$scope.cores = ["black","green","red","yellow","blue","pink","orange"];
	$scope.simbol = ["glyphicon-question-sign", "glyphicon-leaf", "glyphicon-fire",
		"glyphicon-certificate","glyphicon-eye-open","glyphicon-heart-empty","glyphicon-plane"];
	$scope.escolha = {cor1:1,cor2:2,cor3:3,cor4:4};

	$scope.palpites = [];
	$scope.palpite = {cor1:0,cor2:0,cor3:0,cor4:0};

	function sortear() {
		var jaSorteada=[];
		for (var cor in $scope.escolha) {

			var corSorteada=0;
			do {
				corSorteada=Math.floor((Math.random()*6)+1);
			} while (jaSorteada.indexOf(corSorteada)>=0);

			jaSorteada.push(corSorteada); // impede de ser sorteada novamente
			$scope.escolha[cor]=corSorteada;
		}
		seqCodigo = (($scope.escolha.cor1-1)*216)
			+(($scope.escolha.cor2-1)*36)
			+(($scope.escolha.cor3-1)*6)
			+($scope.escolha.cor4-1);
	}

	function escolhaBySeqCodigo() {
		var resto = (seqCodigo%1296);
		$scope.escolha.cor1 = (~~(resto/216))+1;
		resto = (seqCodigo%216);
		$scope.escolha.cor2 = (~~(resto/36))+1;
		resto = (resto%36);
		$scope.escolha.cor3 = (~~(resto/6))+1;
		resto = (resto%6);
		$scope.escolha.cor4 = resto+1;
	}

	function validaEscolha() {
		// garante que as cores sao distintas:
		for (var corI in $scope.escolha) {
			if (($scope.escolha[corI]<1) || ($scope.escolha[corI]>6)) {
				// simbolo invalido
				return false;
			}

			for (var corJ in $scope.escolha) {
				if (corI!=corJ) {
					if ($scope.escolha[corI]===$scope.escolha[corJ]) {
						// simbolo repetido?
						return false;
					}
				}
			}
		}
		return true;
	}

	$scope.reiniciar = function() {
		if (!$routeParams.seqCodigo) {
			$route.reload();
		} else {
			$location.path('/');
		}
	}

	$scope.tentar = function() {
		$scope.palpites.push(angular.copy($scope.palpite));

		// zera o pr�ximo palpite
		$scope.palpite.cor1=0;$scope.palpite.cor2=0;$scope.palpite.cor3=0;$scope.palpite.cor4=0;
	};

	$scope.mudaCor = function(corAtual) {
		if (corAtual+1>=$scope.cores.length) {
			return 1;
		}
		return corAtual+1;
	}

	$scope.avalia = function(palpit) {
		var resp=[];

		// testa os pretos (cor certa no lugar certo)
		for (var corCerta in $scope.escolha) {
			if ($scope.escolha[corCerta]===palpit[corCerta]) {
				resp.push('b');
				continue;
			} else {
				for (var corPalpite in palpit) {
					if (corPalpite !== corCerta && $scope.escolha[corCerta]===palpit[corPalpite]) {
						resp.push('w');
						continue;
					}
				}
			}
		}

		resp.sort();
		return resp;
	} // avalia

	$scope.isAcertou=function() {
		if ($scope.palpites.length<=0) {
			return false;
		}
		var ultPalpit = $scope.palpites[$scope.palpites.length-1]
		/* indica se o codigo esta certo com o ultimo palpite */
	for (var corX in $scope.escolha) {
		if ($scope.escolha[corX]!==ultPalpit[corX]) {
			return false;
		}
	}
	return true;
	}

	$scope.isPerdeu=function() {
		// verifica se ultrapassou o numero de tentativas
		return ($scope.palpites.length>=6) && !$scope.isAcertou();
	}

	$scope.isAcabou=function() {
		return ($scope.isPerdeu() || $scope.isAcertou());
	}


	if(!seqCodigo) {
	  	sortear();
	} else {
		escolhaBySeqCodigo();
		if (!validaEscolha()) {
			$scope.reiniciar();
		}
	}

	$scope.seqCodigo=seqCodigo;

    /* gera evento no google analytics, toda a vez que uma nova instancia deste jogo eh criada */
	$window.ga('send', 'pageview', {page:$location.url()});

}])
.controller("InstrucoesCtrl",['$scope','$window',function($scope, $window) {

	// se for algum bot, ex. googleBot, mostrar as instrucoes para ser indexada.
	var bots = /bot|crawl|slurp|spider|yahoo|facebookExternalHit/i;
	var isBot = bots.test($window.navigator.userAgent);

	// por padrao, so mostra as instrucoes para o googlebot (ou outros) indexar as palavras:
	$scope.mostrarInstrucoes=isBot;

}]);
