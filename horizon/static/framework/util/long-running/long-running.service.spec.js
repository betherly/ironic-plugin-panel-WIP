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

  describe('horizon.framework.util.long-running.service', function () {
    var $q, $timeout, longRunning;

    beforeEach(module('horizon.framework'));
    beforeEach(inject(function ($injector) {
      $q = $injector.get('$q');
      $timeout = $injector.get('$timeout');
      longRunning = $injector.get('horizon.framework.util.long-running.service');
    }));

    it('defines the service as a function.', function () {
      expect(angular.isFunction(longRunning)).toBe(true);
    });

    it('works properly.', function () {
      var complete = false;
      var c = 0;

      longRunning(function () {
        return $q(function (resolve, reject) {
          $timeout(function () {
            if (c++ < 3) {
              resolve({ data: {} });
            } else {
              resolve({ data: { foo: 'bar' } });
            }
          }, 200);
        });
      }, 3000)
        .until(function (response) {
          return response.data.foo === 'bar';
        })
        .then(function () {
          complete = true;
        });

      $timeout.flush();
      $timeout.flush();
      expect(complete).toBe(false);

      $timeout.flush();
      $timeout.flush();
      expect(complete).toBe(false);

      $timeout.flush();
      $timeout.flush();
      expect(complete).toBe(false);

      $timeout.flush();
      $timeout.flush();
      expect(complete).toBe(true);
    });
  });
})();
