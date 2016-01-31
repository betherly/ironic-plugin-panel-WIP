/*
 * Copyright 2015 Hewlett Packard Enterprise Development Company LP
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function () {
  'use strict';

  angular
    .module('horizon.framework.util.long-running', [])
    .factory('horizon.framework.util.long-running.service', serviceFactory);

  /**
   *
   ```js

   // inject 'hz.framework.long-running.service' as longRunning here

   var interval = 3000;

   longRunning(function () {
     return someApi.someMethod(); // returns a promise
   }, interval)

     // repeats invoke the async long-time-running operation
     // if it returned with a `response` object that does not
     // meet a certain condition.

     .until(function (response) {
       return response.data.foo !== null; // returns boolean
     })

     // executes this function when the `until` function return `true`,
     // pass in the same arguments as the one passed to until function.

     .then(function (response) {
       myDataModel.foo = response.data.foo;
     });

   ```
   */
  serviceFactory.$inject = ['$q', '$timeout'];

  function serviceFactory($q, $timeout) {
    return longRunning;

    function longRunning(operation, interval) {
      var conditionFn, deferred = $q.defer();
      loop();
      return {
        until: until
      };

      function until(func) {
        conditionFn = func;
        return deferred.promise;
      }

      function loop() {
        $timeout(function () {
          operation().then(function (data) {
            if (conditionFn(data)) {
              deferred.resolve(data);
            } else {
              loop();
            }
          },
          loop);
        }, interval);
      }
    }
  }

})();
