(function ()
{
  'use strict';

  angular
    .module('app.redirect')
    .controller('RedirectController', RedirectController);

  /** @ngInject */
  function RedirectController($stateParams, $state, api)
  {
    var vm = this;

    if(!!localStorage.getItem('token')){
      $state.go ('app.calendar');
    }
    else {
      api.token.save({id: $stateParams.id}, null, function(result){
          console.log(result);
          localStorage.setItem('token', result.accessToken);
          localStorage.setItem('refreshToken', result.refreshToken);

          $state.go ('app.calendar');
        }
      );
    }

    // Data

    // Methods

    //////////
  }

})();
