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

  describe('horizon.dashboard.admin.ironic.node-details', function () {
    var scope, ctrl, $location;

    beforeEach(module('horizon.dashboard.admin.ironic'));

    beforeEach(inject(function ($controller, $rootScope, $q, _$location_) {
      var basePath = '/static';

      var getNode = function (uuid) {
        var node = {name: 'herp', uuid: uuid};
        var deferred = $q.defer();
        deferred.resolve({data: node});
        return deferred.promise;
      };

      var getPortsWithNode = function (uuid) {
        var ports = [
          uuid + '-port1',
          uuid + '-port2'
        ];

        var deferred = $q.defer();
        deferred.resolve({data: {items: ports}});
        return deferred.promise;
      };

      scope = $rootScope.$new();
      $location = _$location_;
      $location.path('http://localhost/admin/ironic/1234/');

      ctrl = $controller('horizon.dashboard.admin.ironic.NodeDetailsController', {
        $scope: scope,
        $location: $location,
        'hz.api.ironic': {
          getNode: getNode,
          getPortsWithNode: getPortsWithNode
        },
        'horizon.dashboard.admin.ironic.actions': {},
        'horizon.dashboard.admin.basePath': basePath
      });

      scope.$apply();
    }));

    it('should be defined', function () {
      expect(ctrl).toBeDefined();
    });

    it('should have a basePath', function () {
      expect(ctrl.basePath).toBeDefined();
      expect(ctrl.basePath).toEqual('/static');
    });

    it('should have a node', function () {
      expect(ctrl.node).toBeDefined();
      expect(ctrl.node).toEqual({name: 'herp', uuid: '1234'})
    });

    it('should have ports', function () {
      expect(ctrl.ports).toBeDefined();
      expect(ctrl.ports).toEqual(['1234-port1', '1234-port2']);
    });

  });

})();
