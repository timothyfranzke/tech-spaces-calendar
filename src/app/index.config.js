(function ()
{
  'use strict';

  angular
    .module('fuse')
    .config(config);

  /** @ngInject */
  function config($translateProvider)
  {
    // Put your common app configurations here

    // angular-translate configuration
    $translateProvider.useLoader('$translatePartialLoader', {
      urlTemplate: '{part}/i18n/{lang}.json'
    });
    $translateProvider.preferredLanguage('en');
    $translateProvider.useSanitizeValueStrategy('sanitize');
  }

  angular
    .module('fuse').factory('httpRequestInterceptor', function () {
    return {
      request: function (config) {
        if(!!localStorage.getItem('token'))
          config.headers['Authorization'] = 'Bearer ' + localStorage.getItem('token');
        else if(!!localStorage.getItem('refreshToken')){
          var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU5MzVhZGJmZTFhOGY0OWQ3NTY1ODg5ZiIsInJvbGVzIjpbInN5cy1hZG1pbiIsImFkbWluIiwiYWRtaW4iXSwiYXBwbGljYXRpb25fZGF0YSI6eyJlbnRpdHlfaWQiOiI1OTM1YWU3ZWUxYThmNDlkNzU2NTg5MjEifSwiaWF0IjoxNDk2NzE0NTcxLCJleHAiOjE0OTY3MzI1NzEsImF1ZCI6Imstc3BhY2VzLmhlcm9rdWFwcC5jb20iLCJpc3MiOiJodHRwczovL3d3dy50ZWNoLXNwYWNlcy1zZWN1cml0eS5jb20ifQ.cmWGWCIRNi_mnBuu8GwV-VmmJPR1lG82YwE_L_z0UwI';
          config.headers['Authorization'] = 'Bearer ' + localStorage.getItem('token');
          localStorage.setItem('token', token);
        }
        /*          if(!config.url.endsWith('.html') && !config.url.endsWith('.json'))
         {
         if(config.params === undefined){
         config.params = {"ApplicationID":"59e0c23a734d1d1c37fbb760"}
         }else{
         config.params.push({"ApplicationID":"59e0c23a734d1d1c37fbb760"});
         }
         }*/

        return config;
      },
      response: function(config){
        //console.log(config);
        return config;
      },
      responseError : function(config){
        //console.log(config);
        // switch(config.status){
        //   case 401:
        //   case 403:
        //     //console.log("403");
        //     localStorage.clear();
        //     window.location.replace("https://k-spaces-authentication.herokuapp.com/pages/auth/login");
        //     break;
        // }
        return config;
      }
    };
  });

  angular
    .module('fuse').config(function ($httpProvider) {
    $httpProvider.interceptors.push('httpRequestInterceptor');
  });

})();
