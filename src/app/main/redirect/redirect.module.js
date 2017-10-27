(function ()
{
  'use strict';

  angular
    .module('app.redirect', [
      'app.configuration'
    ])
    .config(config);

  /** @ngInject */
  function config($stateProvider, $translatePartialLoaderProvider)
  {
    $stateProvider.state('app.redirect', {
      url      : '/redirect/:id',
      views    : {
        'content@app': {
          templateUrl: 'app/main/redirect/redirect.html',
          controller : 'RedirectController as vm'
        }
      },
      bodyClass: 'redirect'
    });


    // Translation
    $translatePartialLoaderProvider.addPart('app/main/pages/redirect');
  }

})();
