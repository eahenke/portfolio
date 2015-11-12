;(function(window) {
	angular.module('app', ['weatherApp', 'clockApp', 'geolocation']);
})(window);

;(function(window) {
    var apiKeys = {
        openWeatherMap: 'a0d7e44cdb26abb996246b544a26f161',
        geonames: 'eahenke',
    };
    window.apiKeys = apiKeys;
})(window);
;(function(window) {
    var weatherApp = angular.module('weatherApp', ['geolocation']);
})(window);
;(function(window) {
    var weatherApp = angular.module('weatherApp');

    weatherApp.controller('WeatherCtrl', ['weatherSrvc', 'geolocationService', function(weatherSrvc, geolocationService) {
        var self = this;


        //initial defaults
        self.currentCity = 'Chicago';
        self.timezone = '-0600';


        //Calls weatherSrvc, searched by city
        self.searchByCity = function(city) {
            self.newCity = '';
            weatherSrvc.getWeatherByCity(city).then(function(result) {
                update(result);
                getLocalTime(result.city.lat, result.city.lon);
            }, function(error){
                //for debug
                console.dir(error);
            });     
        };

        //Calls weatherSrvc, searches by lat, lon
        self.searchByCoord = function(lat, lon) {
            weatherSrvc.getWeatherByCoord(lat, lon).then(function(result) {
                update(result);
                getLocalTime(lat, lon);
            }, function(error) {
                //for debug
                console.dir(error);
            });     
        };

        //Calls geolocation service to get local lat, lon and searches by lat, lon
        function getCurrent() {

            geolocationService.getLocation().then(function(result) {

                var lat = result.latitude;
                var lon = result.longitude;  
                self.searchByCoord(lat, lon);
                
            }, function(error) { //user blocked                
                self.searchByCity(self.currentCity);
            });
        };

        //get local timezone by lat, lon and set timezone
        function getLocalTime(lat, lon) {
            geolocationService.getLocalTime(lat, lon).then(function(time) {
                self.timezone = time;
            }, function(error) {
                console.dir(error);
            });
        }

        //update city, weather, temp
        function update(result) {
            self.currentCity = result.city.name;
            self.currentWeather = result.description;
            self.currentTemp = result.temp;
            self.dayOrNight = result.dayOrNight;
            self.iconClass = result.iconClass;
        }

        getCurrent();

    }]);
})(window);
;(function(){
    var weatherApp = angular.module('weatherApp');

    weatherApp.directive('weather', function() {
        return {
            restricted:'E',
            scope: {},
            templateUrl: 'dist/templates/_weather.html'
        }
    });

})();
;(function(window) {
    var weatherApp = angular.module('weatherApp');

    //Takes a tempertature in fahrenheit and formats it, followed by Celsius equivalent
    weatherApp.filter('temperature', function() {
        return function(temp) {
                if(temp) {
                    temp = parseInt(temp);
                    var celsius = Math.round((temp - 32) * ( 5/ 9)); 
                    var output = temp + '\xB0F / ' + celsius + '\xB0C';
                    return output;
                    
                } else {
                    //prevent showing 'NaN' if null or undefined
                    return '';
                }
        };
    });
})(window);
;(function(window) {

    var weatherApp = angular.module('weatherApp');

    //Weather Service
    weatherApp.factory('weatherSrvc', ['$http', '$q', function($http, $q) {
        
        //API constants
        var OPEN_WEATHER_URL = 'http://api.openweathermap.org/data/2.5/weather';
        var API_KEY = apiKeys.openWeatherMap;

        //Format http request config object for searching by lat/lon
        var getWeatherByCoord = function(lat, lon) {
            var options = {
                method: 'jsonp',
                url: OPEN_WEATHER_URL,
                params: {
                    lat: lat,
                    lon: lon,
                    units: 'imperial',
                    APPID: API_KEY,
                    callback: 'JSON_CALLBACK',
                }                
            };

            return request(options);            
        };

        //format http request config object for searching by city
        var getWeatherByCity = function(city) {
            var options = {
                method: 'jsonp',
                url: OPEN_WEATHER_URL,
                params: {
                    q: city,
                    units: 'imperial',
                    APPID: API_KEY,
                    callback: 'JSON_CALLBACK',
                }                
            };
            return request(options);   
        };

        //Calls OpenWeatherMap API and returns object with city, weather, and temp
        function request(options) {
            var defer = $q.defer();

            var weather = {};

            $http.jsonp(options.url, options).then(function(response) {
                var data = response.data;
                                
                if(data) {
                    weather.city = {
                        name: data.name,
                        lat: data.coord.lat,
                        lon: data.coord.lon,
                    };
                    
                    if(data.weather[0]) {
                        weather.main = data.weather[0].main;
                        weather.description = data.weather[0].description;
                        
                        var iconCode = data.weather[0].icon;
                        var weatherCode = data.weather[0].id;
                        
                        weather.dayOrNight = getDayOrNight(iconCode);
                        weather.iconClass = getIconClass(weatherCode, weather.dayOrNight);
                    }

                    if(data.main) {
                        weather.temp = data.main.temp;
                    }
                } else {
                    //missing data
                    console.log('no data');
                }

                defer.resolve(weather);
                
            }, function(error) {
                //add error functionality
                console.dir(error);
                defer.reject(error);
            });

            return defer.promise;
        }

        //Determines icon class based on weather-code for type, and iconCode for day vs night.  Relevant codes from openweathermap.com
        function getIconClass(weatherCode, time) {

            var firstDigit = weatherCode.toString().charAt(0);
            var icon;

            if(weatherCode == 800) {
                icon = 'icon-clear-' + time;
            }else if(firstDigit == '8') {
                icon = 'icon-cloud-' + time;
            } else {
                //Weather codes from openweathermap.com
                var codeTable = {
                    '2' : 'thunder',
                    '3' : 'rain',
                    '5' : 'rain',
                    '6' : 'snow',
                    '7' : 'mist',
                }
                icon = 'icon-' + codeTable[firstDigit];
            }

            return icon;
        }

        //Checks icon code to determine day or night
        function getDayOrNight(iconCode) {
            var time = '';
            
            //icon codes are in the form of 'XXd' or 'XXn'
            if(iconCode) {
                time = iconCode.slice(-1) == 'd' ? 'day' : 'night';           
            }            
            return time;
        }

        //exposed methods
        return {
            getWeatherByCity: getWeatherByCity,
            getWeatherByCoord: getWeatherByCoord
        }
    }]);
})(window);
;(function(window) {
    var clockApp = angular.module('clockApp', []);
})(window);
;(function(window) {
    var clockApp = angular.module('clockApp');

    clockApp.directive('clock', ['$interval', 'dateFilter', function($interval, dateFilter) {
        return {
            restricted: 'E',
            scope: {
                format: '@?',
                
            },
            link: function(scope, element, attrs) {
                //default to hour, minutes
                if(scope.format == undefined) {
                    scope.format = 'h:mm a';
                }

                var timeoutId;

                function updateTime() {
                    element.text(dateFilter(new Date(), scope.format, attrs.timezone));
                }

                //always destroy $intervals
                element.on('$destroy', function() {
                    $interval.cancel(timeoutId);
                });

                //update every second
                timeoutId = $interval(function() {
                    updateTime();
                }, 1000);

                //initialize
                updateTime();
            }
        }
    }]);

})(window);
;(function(window){
    var geolocation = angular.module('geolocation', []);
})(window);
;(function(window) {
    var geolocation = angular.module('geolocation');

    geolocation.factory('geolocationService', ['$q', '$http', function($q, $http) {

        //Gets user location, if geolocation enabled.
        var getLocation = function() {
            var defer = $q.defer();

            if(navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position){
                    defer.resolve(position.coords);

                }, function(error) {
                    defer.reject(error);
                });
            } else { //disabled
                defer.reject(false);
            }

            return defer.promise;
        }

        //Takes a latitude and longitude and calls tp World Weather Online Timezone API and returns UTC offset
        var getLocalTime = function(lat, lon) {

            var options = {
                url: 'http://api.geonames.org/timezoneJSON',
                method: 'jsonp',
                params: {
                    lat: lat,
                    lng: lon,
                    username: 'eahenke',
                    callback: 'JSON_CALLBACK'
                }
            }

            var defer = $q.defer();

            $http.jsonp(options.url, options).then(function(response) {
                var offset = response.data.rawOffset;
                var timezone = offsetFormat(offset);

                defer.resolve(timezone);
            }, function(error) {
                //debuging, add better error handling later
                console.dir(error);
                defer.reject(error);
            });

            return defer.promise;

        };

        //Takes an offset string in the form '(-)h(.m)'  and returns offset in form of '(-/+)hhmm' 
        function offsetFormat(offset) {            
            var split, sign, hours, minutes;
            offset = offset.toString();

            if(offset.charAt(0) == '-') {
                sign = '-';
                split = offset.slice(1).split('.');
            } else {
                sign = '+';
                split = offset.split('.');
            }
            hours = split[0];
            minutes = split[1];

            //convert percentage to minutes
            if(minutes == '5') {
                minutes = '30';
            } else {
                minutes = '00';
            }

            //add padding
            if(hours.length < 2) {
                hours = '0' + hours;
            }

            return sign + hours + minutes;
        }

        //exposed methods
        return {
            getLocation: getLocation,
            getLocalTime: getLocalTime
        }
    }]);
})(window);