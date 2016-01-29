angular
  .module('app', [
    'ui.router',
    'lbServices'
  ])
  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider,
      $urlRouterProvider) {
    $stateProvider
       .state('home', {
                url: '/',
                templateUrl: 'app/client/index.html',
                controller: 'HomeCtrl',
                controllerAs: 'vm'
            })
      .state('all-sensors', {
        url: '/all-sensors',
        templateUrl: 'app/views/all-sensors.html',
        controller: 'AddSensorsController',
      })
  }])
