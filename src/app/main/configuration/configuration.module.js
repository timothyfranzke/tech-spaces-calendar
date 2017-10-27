(function ()
{
  'use strict';

  angular
    .module('app.configuration',[])
    .constant('config', {
      api:{
        //baseUrl: 'https://k-spaces-api.herokuapp.com/api',
        baseUrl: 'http://localhost:3008/api',
        user:'/user',
        userGroup:'/user',
        entities: '/entity',
        calendar: '/event',
        spaces: '/spaces',
        search: '/search',
        location: '/location',
        profile: '/profile',
        financial: '/financial',
        tuitionRate: '/tuition_rate',
        payPeriod: '/pay-period',
        parameters: {
          id: '/:id'
        }
      },
      securityApi: {
        //baseUrl: 'https://tech-spaces-security.herokuapp.com',
        baseUrl: 'http://localhost:3009',
        token: '/token',
        login: '/login',
        applicationRedirect: '/application-redirect'
      },
      authentication:{
        //baseUrl: 'https://k-spaces-authentication.herokuapp.com/pages/auth',
        baseUrl: 'http://localhost:3000/pages/auth',
        login: '/login',
        register: '/register'
      },
      image:{
        baseUrl: 'https://www.franzkedesigner.com/kspaces-img',
        create: '/CreateImageService.php',
        thumb: 'http://www.franzkedesigner.com/img/kspaces/',
        full: 'http://www.franzkedesigner.com/img/kspaces/'
      },
      toast_types:{
        error: 1,
        info: 2
      }
    });
})();
