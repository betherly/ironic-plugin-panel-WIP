/*
 * © Copyright 2015 Hewlett Packard Enterprise Development Company LP
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

  var POWER_STATE_ON ='power on';
  var POWER_STATE_OFF = 'power off';

  angular
      .module('horizon.dashboard.admin.ironic')
      .factory('horizon.dashboard.admin.ironic.actions', actions);

  actions.$inject = [
    'horizon.app.core.openstack-service-api.ironic'
  ];

  function actions(ironic) {
    var service = {
      powerOn: powerOn,
      powerOff: powerOff,
      powerOnAll: powerOnAll,
      powerOffAll: powerOffAll,
      putNodeInMaintenanceMode: putNodeInMaintenanceMode,
      removeNodeFromMaintenanceMode: removeNodeFromMaintenanceMode,
      putAllInMaintenanceMode: putAllInMaintenanceMode,
      removeAllFromMaintenanceMode: removeAllFromMaintenanceMode
    };

    return service;

    // power state

    function powerOn(node) {
      if (node.power_state !== POWER_STATE_OFF) {
        return;
      }
      node.power_state = null;
      node.target_power_state = POWER_STATE_ON;
      return ironic.powerOnNode(node.uuid);
    }

    function powerOff(node) {
      if (node.power_state !== POWER_STATE_ON) {
        return;
      }
      node.power_state = null;
      node.target_power_state = POWER_STATE_OFF;
      return ironic.powerOffNode(node.uuid);
    }

    function powerOnAll(selected) {
      operateAll(powerOn, selected);
    }

    function powerOffAll(selected) {
      operateAll(powerOff, selected);
    }

    // maintenance

    function putNodeInMaintenanceMode(node) {
      if (node.maintenance !== false) {
        return;
      }
      node.maintenance = null;
      ironic.putNodeInMaintenanceMode(node.uuid).then(
        function () {
          node.maintenance = true;
        }
      );
    }

    function removeNodeFromMaintenanceMode(node) {
      if (node.maintenance !== true) {
        return;
      }
      node.maintenance = null;
      ironic.removeNodeFromMaintenanceMode(node.uuid).then(
        function () {
          node.maintenance = false;
        }
      );
    }

    function putAllInMaintenanceMode(selected) {
      operateAll(putNodeInMaintenanceMode, selected);
    }

    function removeAllFromMaintenanceMode(selected) {
      operateAll(removeNodeFromMaintenanceMode, selected);
    }

    function operateAll(fn, selected) {
      for (var key in selected) {
        if (selected[key].checked) {
          fn(selected[key].item)
        }
      }
    }
  }

})();
