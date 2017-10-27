(function ()
{
    'use strict';

    angular
        .module('app.calendar',
            [
                // 3rd Party Dependencies
                'ui.calendar',
                'app.configuration'
            ]
        )
        .config(configuration);

    /** @ngInject */
    function configuration($stateProvider, $translatePartialLoaderProvider, msNavigationServiceProvider, msApiProvider, config)
    {
        // State
        $stateProvider.state('app.calendar', {
            url      : '/calendar',
            views    : {
                'content@app': {
                    templateUrl: 'app/main/calendar/calendar.html',
                    controller : 'CalendarController as vm'
                }
            },
          resolve: {
            Events: function (msApi)
            {
              return msApi.resolve('calendar.events@get');
            }
          },
            bodyClass: 'calendar'
        });

        // Translation
        $translatePartialLoaderProvider.addPart('app/main/apps/calendar');

        msApiProvider.register('calendar.events', [config.api.baseUrl + config.api.calendar]);
        // Navigation
        msNavigationServiceProvider.saveItem('calendar', {
            title : 'Calendar',
            icon  : 'icon-calendar-today',
            state : 'app.calendar',
            weight: 1
        });
    }
})();
