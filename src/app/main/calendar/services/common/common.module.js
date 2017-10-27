(function ()
{
    'use strict';

    angular
        .module('app.common', [])
        .factory('CommonService', CommonService)
        .controller('ConfirmController', ConfirmController)
        .filter('tel', phoneFilter)
        .directive('phoneInput', phoneInput);

    /** @ngInject */
    function CommonService($q, $mdToast, config, api)
    {
        var profile = {};
        var service = {
            setToast      : setToast,
            confirmDialog : confirmDialog,
            getProfile    : getProfile,
            isEmptyObject : isEmpty,
            generateId    : generateId,
            searchUser    : searchUser,
            addDays       : addDays,
            addMonths     : addMonths,
        };

        function setToast (message, type){
            var highlight = 'md-accent';
            if(type === config.toast_types.error)
            {
                highlight = 'md-warn';
                message = 'ERROR: ' + message;
            }
            var toast = $mdToast.simple()
                .textContent(message)
                .highlightClass(highlight)
                .position("bottom right");
            $mdToast.show(toast)
        }

        function confirmDialog (callback){
            $mdDialog.show({
                controller:'ConfirmController',
                templateUrl: 'app/main/services/common/dialogs/confirm/confirm.html',
                clickOutsideToClose: true,
                fullscreen : false
            }).then(callback);
        }

        function getProfile (){
            var loaded = false;
            var attempts = 0;


            // Create a new deferred object
            var deferred = $q.defer();

            // If we have already loaded the locations,
            // don't do another API call, get them from
            // the array
            if(profile.legal_name !== undefined)
            {
                console.log(profile);
                deferred.resolve(profile);
            }
            // otherwise make an API call and load
            // the locations
            else
            {
                setTimeout(function() {
                    api.profile.get(function(res){
                            console.log("API returning for profile");
                            profile = res.data;
                            console.log(profile);
                            deferred.resolve(profile);
                        },

                        function(err){
                            deferred.reject(err);
                        }
                    );
                }, 1000);

            }
            return deferred.promise;
        }
        return service;
    }

    function ConfirmController($scope){
        $scope.yes = function(){
            $mdDialog.hide();
        };
        $scope.no = function(){
            $mdDialog.cancel();
        };
    }

    function isEmpty(obj) {

        // null and undefined are "empty"
        if (obj == null) return true;

        // Assume if it has a length property with a non-zero value
        // that that property is correct.
        if (obj.length > 0)    return false;
        if (obj.length === 0)  return true;

        // If it isn't an object at this point
        // it is empty, but it can't be anything *but* empty
        // Is it empty?  Depends on your application.
        if (typeof obj !== "object") return true;

        // Otherwise, does it have any properties of its own?
        // Note that this doesn't handle
        // toString and valueOf enumeration bugs in IE < 9
        for (var key in obj) {
            if (hasOwnProperty.call(obj, key)) return false;
        }

        return true;
    }

    function phoneInput($filter, $browser) {
        return {
            require: 'ngModel',
            link: function($scope, $element, $attrs, ngModelCtrl) {
                var listener = function() {
                    var value = $element.val().replace(/[^0-9]/g, '');
                    $element.val($filter('tel')(value, false));
                };

                // This runs when we update the text field
                ngModelCtrl.$parsers.push(function(viewValue) {
                    return viewValue.replace(/[^0-9]/g, '').slice(0,10);
                });

                // This runs when the model gets updated on the scope directly and keeps our view in sync
                ngModelCtrl.$render = function() {
                    $element.val($filter('tel')(ngModelCtrl.$viewValue, false));
                };

                $element.bind('change', listener);
                $element.bind('keydown', function(event) {
                    var key = event.keyCode;
                    // If the keys include the CTRL, SHIFT, ALT, or META keys, or the arrow keys, do nothing.
                    // This lets us support copy and paste too
                    if (key == 91 || (15 < key && key < 19) || (37 <= key && key <= 40)){
                        return;
                    }
                    $browser.defer(listener); // Have to do this or changes don't get picked up properly
                });

                $element.bind('paste cut', function() {
                    $browser.defer(listener);
                });
            }

        };
    };

    function phoneFilter() {
        return function (tel) {
            console.log(tel);
            if (!tel) { return ''; }

            var value = tel.toString().trim().replace(/^\+/, '');

            if (value.match(/[^0-9]/)) {
                return tel;
            }

            var country, city, number;

            switch (value.length) {
                case 1:
                case 2:
                case 3:
                    city = value;
                    break;

                default:
                    city = value.slice(0, 3);
                    number = value.slice(3);
            }

            if(number){
                if(number.length>3){
                    number = number.slice(0, 3) + '-' + number.slice(3,7);
                }
                else{
                    number = number;
                }

                return ("(" + city + ") " + number).trim();
            }
            else{
                return "(" + city;
            }

        };
    };

    function generateId(){
        var id = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 20; i++)
            id += possible.charAt(Math.floor(Math.random() * possible.length));

        return id;
    };

    function searchUser(searchText, searchList){
        var searchUser = [];
        searchList.forEach(function(searchObject){
            if(searchObject.legal_name.first.toLowerCase().trim().indexOf(searchText.toLowerCase().trim()) >= 0 || searchObject.legal_name.last.toLowerCase().trim().indexOf(searchText.toLowerCase().trim()) >= 0)
            {
                searchUser.push(searchObject);
            }
        });

        return searchUser;
    }

    function addDays(date, numberOfDays){
        console.log(date);
        console.log(numberOfDays);
        var dat = new Date(date);
        console.log(dat);
        console.log(dat.getDate());
        dat.setDate(dat.getDate() + numberOfDays);
        console.log(dat);
        return dat;
    }
    function addMonths(date, number){
        var dat = new Date(date);
        dat.setMonth(dat.getMonth() + number);
        return dat;
    }
})();

