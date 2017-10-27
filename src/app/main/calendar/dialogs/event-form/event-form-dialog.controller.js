(function ()
{
    'use strict';

    angular.module('app.calendar')
        .controller('EventFormDialogController', EventFormDialogController);

    /** @ngInject */
    function EventFormDialogController($mdDialog, dialogData, managerService, $document)
    {
        var vm              = this;
        vm.inviteContacts   = [];
        vm.selectedTab      = 1;
        vm.every            = ["Never", "Every"];
        vm.attributes       = ["Days", "Weeks", "Months"];
        vm.querySearch      = querySearch;

        vm.filterSelected = true;
        vm.users = [];

        managerService.getUsers().then(function(users){
            users.forEach(function(user){
                if(user.legal_name !== undefined && user.legal_name.first !== undefined && user.legal_name.last !== undefined) {
                    vm.users.push(user);
                }
            });
            managerService.getSpaces().then(function(spaces){
                vm.spaces = spaces;
                vm.allContacts = loadContacts();
                vm.contacts = [vm.allContacts[0]];
            });
        });
        // Data
        vm.dialogData = dialogData;
        vm.notifications = ['15 minutes before', '30 minutes before', '1 hour before'];

        // Methods
        vm.saveEvent        = saveEvent;
        vm.removeEvent      = removeEvent;
        vm.closeDialog      = closeDialog;
        vm.searchContacts   = searchContacts;
        vm.showRepeatDialog = showRepeatDialog;
        vm.selectTab        = selectTab;
        vm.getNumber        = getNumber;

        init();

        //////////

        /**
         * Initialize
         */
        function init()
        {
            // Figure out the title
            switch ( vm.dialogData.type )
            {
                case 'add' :
                    vm.dialogTitle = 'Add Event';
                    break;

                case 'edit' :
                    vm.dialogTitle = 'Edit Event';
                    break;

                default:
                    break;
            }

            // Edit
            if ( vm.dialogData.calendarEvent )
            {
                // Clone the calendarEvent object before doing anything
                // to make sure we are not going to brake FullCalendar
                vm.calendarEvent = angular.copy(vm.dialogData.calendarEvent);

                // Convert moment.js dates to javascript date object
                if ( moment.isMoment(vm.calendarEvent.start) )
                {
                    vm.calendarEvent.start = vm.calendarEvent.start.toDate();
                }

                if ( moment.isMoment(vm.calendarEvent.end) )
                {
                    vm.calendarEvent.end = vm.calendarEvent.end.toDate();
                }
            }
            // Add
            else
            {
                // Convert moment.js dates to javascript date object
                if ( moment.isMoment(vm.dialogData.start) )
                {
                    vm.dialogData.start = vm.dialogData.start.toDate();
                }

                if ( moment.isMoment(vm.dialogData.end) )
                {
                    vm.dialogData.end = vm.dialogData.end.toDate();
                }

                vm.calendarEvent = {
                    start        : vm.dialogData.start,
                    end          : vm.dialogData.end,
                    notifications: [],
                    repeat       : {
                        every    : "Never",
                        number   : 1,
                        frequency: "Days"
                    }
                };
            }
        }

        /**
         * Show event detail dialog
         * @param calendarEvent
         * @param e
         */
        function showRepeatDialog(e)
        {
            console.log(e);
            $mdDialog.show({
                controller         : 'EventRepeatDialogController',
                controllerAs       : 'vm',
                templateUrl        : 'app/main/apps/calendar/dialogs/event-repeat/event-repeat-dialog.html',
                parent             : angular.element($document.body),
                targetEvent        : e,
                clickOutsideToClose: true,
                locals             : {
                    event              : e
                }
            });
        }

        function searchContacts(criteria){
            var contactList = [];
            var searchCriteria = criteria.split(" ");
            console.log(criteria);
            console.log(vm.users);
            vm.users.forEach(function(user){
                if(user.legal_name !== undefined){
                    if(searchCriteria.length > 1)
                    {
                        if(user.legal_name.first.startsWith(searchCriteria[0]) && user.legal_name.last.startsWith(searchCriteria[1]))
                        {
                            contactList.push(user);
                        }
                    }
                    else{
                        console.log(user.legal_name);
                        if(user.legal_name.first.startsWith(criteria) || user.legal_name.last.startsWith(criteria)){
                            contactList.push(user);
                        }
                    }
                }
            });
            console.log(contactList);
            return contactList;
        }

        /**
         * Save the event
         */
        function saveEvent()
        {
            // Convert the javascript date objects back to the moment.js dates
            if(vm.calendarEvent.startTime !== undefined)
            {
              var day = vm.calendarEvent.start.getDate();
              var month = vm.calendarEvent.start.getMonth();
              var year = vm.calendarEvent.start.getFullYear();
              var hour = vm.calendarEvent.startTime.getHours();
              var minute = vm.calendarEvent.startTime.getMinutes();
              vm.calendarEvent.start = new Date(year, month, day, hour, minute);
              //console.log(day + " " + month + " " + year + " " + hour + " " + minute);
            }
          if(vm.calendarEvent.endTime !== undefined)
          {
            var day = vm.calendarEvent.end.getDate();
            var month = vm.calendarEvent.end.getMonth();
            var year = vm.calendarEvent.end.getFullYear();
            var hour = vm.calendarEvent.endTime.getHours();
            var minute = vm.calendarEvent.endTime.getMinutes();
            vm.calendarEvent.end = new Date(year, month, day, hour, minute);
            //console.log(day + " " + month + " " + year + " " + hour + " " + minute);
          }
            var dates = {
                start: vm.calendarEvent.start,
                end  : vm.calendarEvent.end
            };

            var response = {
                type         : vm.dialogData.type,
                calendarEvent: angular.extend({}, vm.calendarEvent, dates)
            };

            $mdDialog.hide(response);
        }

        /**
         * Remove the event
         */
        function removeEvent()
        {
            var response = {
                type         : 'remove',
                calendarEvent: vm.calendarEvent
            };

            $mdDialog.hide(response);
        }

        /**
         * Close the dialog
         */
        function closeDialog()
        {
            $mdDialog.cancel();
        }

        function selectTab(tab){
            vm.selectedTab = tab;
        }

        function getNumber(){
            return new Array(100);
        }

        /**
         * Search for contacts.
         */
        function querySearch (query) {
            var results = query ?
                vm.allContacts.filter(createFilterFor(query)) : [];
            return results;
        }

        /**
         * Create filter function for a query string
         */
        function createFilterFor(query) {
            var lowercaseQuery = angular.lowercase(query);

            return function filterFn(contact) {
                return (contact._lowername.indexOf(lowercaseQuery) != -1);
            };

        }

        function loadContacts() {
            var contacts = [];
            var moreContacts = [];
            console.log(vm.users);
            if(vm.users !== undefined){
                contacts = vm.users.concat(vm.spaces);

                console.log(contacts);
                return contacts.map(function (user, index) {
                    if(user != undefined)
                    {
                        if(user.legal_name != undefined){
                            var contact = {
                                name: user.legal_name.first + ' ' + user.legal_name.last + ' (' + user.role + ')',
                                email: user.email,
                                image: (user.avatar.thumb != undefined && user.avatar.thumb != "") ? user.avatar.thumb : 'assets/images/avatars/profile.jpg',
                                _id : user._id
                            };
                            contact._lowername = contact.name.toLowerCase();
                            return contact;
                        }
                        else if(user.name != undefined){
                            var contact = {
                                name: user.name + ' (space)',
                                email: "",
                                image: (user.avatar.thumb != undefined && user.avatar.thumb != "") ? user.avatar.thumb : 'assets/images/avatars/profile.jpg',
                                _id : user._id
                            };
                            contact._lowername = contact.name.toLowerCase();
                            return contact;
                        }
                    }
                    return {};
                });
            }
            return contacts;
        }
    }
})();
