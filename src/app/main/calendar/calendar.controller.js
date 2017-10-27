(function ()
{
    'use strict';

    angular
        .module('app.calendar')
        .controller('CalendarController', CalendarController);

    /** @ngInject */
    function CalendarController($mdDialog, $document, api, Events, CommonService)
    {
        var vm = this;

        // Data
        var date = new Date();
        var d = date.getDate();
        var m = date.getMonth();
        var y = date.getFullYear();
        var events = [];
        vm.events = [];

        //find all repeating events
        Events.data.forEach(function(event){
            events.push(event);
            if(event.repeat !== undefined)
            {
                if(event.repeat.every === 'Every'){
                    var newEvent = {
                        _id      : event._id,
                        start    : event.start,
                        end      : event.end,
                        title    : event.title
                    };

                    for(var i = 0; i < 20; i++){

                        switch(event.repeat.frequency){
                            case 'Days':
                                newEvent.start = CommonService.addDays(newEvent.start, parseInt(event.repeat.number.trim())).toISOString();
                                newEvent.end = CommonService.addDays(newEvent.end, parseInt(event.repeat.number.trim())).toISOString();
                                break;
                            case 'Weeks':
                                newEvent.start = CommonService.addDays(newEvent.start, parseInt(event.repeat.number.trim()) * 7).toISOString();
                                newEvent.end = CommonService.addDays(newEvent.end, parseInt(event.repeat.number.trim()) * 7).toISOString();
                                break;
                            case 'Months':
                                newEvent.start = CommonService.addMonths(newEvent.start, parseInt(event.repeat.number.trim())).toISOString();
                                newEvent.end = CommonService.addMonths(newEvent.end, parseInt(event.repeat.number.trim())).toISOString();
                                break;
                        }
                        events.push(newEvent);
                        newEvent = JSON.parse(JSON.stringify(newEvent));
                        i++;
                    }
                }
            }
        });
        vm.events[0] = events;
        console.log(events);

        vm.calendarUiConfig = {
            calendar: {
                editable          : true,
                eventLimit        : true,
                header            : '',
                handleWindowResize: false,
                aspectRatio       : 1,
                dayNames          : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                dayNamesShort     : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                viewRender        : function (view)
                {
                    vm.calendarView = view;
                    vm.calendar = vm.calendarView.calendar;
                    vm.currentMonthShort = vm.calendar.getDate().format('MMM');
                },
                columnFormat      : {
                    month: 'ddd',
                    week : 'ddd D',
                    day  : 'ddd M'
                },
                eventClick        : eventDetail,
                selectable        : true,
                selectHelper      : true,
                select            : select
            }
        };

        // Methods
        vm.addEvent = addEvent;
        vm.next = next;
        vm.prev = prev;

        //////////

        /**
         * Go to next on current view (week, month etc.)
         */
        function next()
        {
            vm.calendarView.calendar.next();
        }

        /**
         * Go to previous on current view (week, month etc.)
         */
        function prev()
        {
            vm.calendarView.calendar.prev();
        }

        /**
         * Show event detail
         *
         * @param calendarEvent
         * @param e
         */
        function eventDetail(calendarEvent, e)
        {
            showEventDetailDialog(calendarEvent, e);
        }

        /**
         * Add new event in between selected dates
         *
         * @param start
         * @param end
         * @param e
         */
        function select(start, end, e)
        {
            showEventFormDialog('add', false, start, end, e);
        }

        /**
         * Add event
         *
         * @param e
         */
        function addEvent(e)
        {
            var start = new Date(),
                end = new Date();

            showEventFormDialog('add', false, start, end, e);
        }

        /**
         * Show event detail dialog
         * @param calendarEvent
         * @param e
         */
        function showEventDetailDialog(calendarEvent, e)
        {
            $mdDialog.show({
                controller         : 'EventDetailDialogController',
                controllerAs       : 'vm',
                templateUrl        : 'app/main/apps/calendar/dialogs/event-detail/event-detail-dialog.html',
                parent             : angular.element($document.body),
                targetEvent        : e,
                clickOutsideToClose: true,
                locals             : {
                    calendarEvent      : calendarEvent,
                    showEventFormDialog: showEventFormDialog,
                    event              : e
                }
            });
        }

        /**
         * Show event add/edit form dialog
         *
         * @param type
         * @param calendarEvent
         * @param start
         * @param end
         * @param e
         */
        function showEventFormDialog(type, calendarEvent, start, end, e)
        {
            var dialogData = {
                type         : type,
                calendarEvent: calendarEvent,
                start        : start,
                end          : end
            };

            $mdDialog.show({
                controller         : 'EventFormDialogController',
                controllerAs       : 'vm',
                templateUrl        : 'app/main/apps/calendar/dialogs/event-form/event-form-dialog.html',
                parent             : angular.element($document.body),
                targetEvent        : e,
                clickOutsideToClose: true,
                locals             : {
                    dialogData: dialogData
                }
            }).then(function (response)
            {
                switch ( response.type )
                {
                    case 'add':
                        var event = {
                          title: response.calendarEvent.title,
                          start: response.calendarEvent.start,
                          end  : response.calendarEvent.end,
                          repeat : response.calendarEvent.repeat
                        };
                        api.event.save(event, function(res){
                          event._id = res;
                          vm.events[0].push(
                            event
                          );

                        });

                        break;

                    case 'edit':
                        // Edit
                        for ( var i = 0; i < vm.events[0].length; i++ )
                        {
                            // Update
                            if ( vm.events[0][i]._id === response.calendarEvent._id )
                            {
                                var event = {
                                  title: response.calendarEvent.title,
                                  start: response.calendarEvent.start,
                                  end  : response.calendarEvent.end,
                                    repeat : response.calendarEvent.repeat
                                };
                                vm.events[0][i] = event;
                                api.event.update({id:response.calendarEvent._id}, event);
                                break;
                            }
                        }
                        break;

                    case 'remove':
                        // Remove
                        for ( var j = 0; j < vm.events[0].length; j++ )
                        {
                            // Update
                            if ( vm.events[0][j]._id === response.calendarEvent._id )
                            {
                                vm.events[0].splice(j, 1);
                                api.event.delete({id:response.calendarEvent._id});
                                break;
                            }
                        }
                        break;
                }
            });
        }
    }

})();
