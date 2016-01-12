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

  var POWER_STATE_ON ='power on';
  var POWER_STATE_OFF = 'power off';

  angular
      .module('horizon.dashboard.admin.ironic')
      .factory('horizon.dashboard.admin.ironic.actions', actions);

  actions.$inject = [
    'horizon.app.core.openstack-service-api.ironic',
    'horizon.framework.long-running.service',
    'horizon.framework.widgets.modal.prompt'
  ];

  function actions(ironic, longRunning, prompt) {
    var service = {
      powerOn: powerOn,
      powerOff: powerOff,
      powerOnAll: powerOnAll,
      powerOffAll: powerOffAll,
      promptForPutNodeInMaintenanceMode: promptForPutNodeInMaintenanceMode,
      putNodeInMaintenanceMode: putNodeInMaintenanceMode, // expose for testing
      removeNodeFromMaintenanceMode: removeNodeFromMaintenanceMode,
      promptForPutAllInMaintenanceMode: promptForPutAllInMaintenanceMode,
      putAllInMaintenanceMode: putAllInMaintenanceMode, // expose for testing
      removeAllFromMaintenanceMode: removeAllFromMaintenanceMode,
      updateNode: updateNode,
      operateAll: operateAll // expose for testing
    };

    return service;

    // power state

    function powerOn(node) {
      if (node.power_state !== POWER_STATE_OFF) {
        return;
      }
      node.power_state = null;
      node.target_power_state = POWER_STATE_ON;
      ironic.powerOnNode(node.uuid).then(function () {
        updateNode(node);
      });
    }

    function powerOff(node) {
      if (node.power_state !== POWER_STATE_ON) {
        return;
      }
      node.power_state = null;
      node.target_power_state = POWER_STATE_OFF;
      ironic.powerOffNode(node.uuid).then(function () {
        updateNode(node);
      });
    }

    function updateNode(node) {
      longRunning(function () {
        return ironic.getNode(node.uuid);
      }, 3000)
      .until(function (response) {
        return response.data.target_power_state === null;
      })
      .then(
        function (response) {
          node.power_state = response.data.power_state;
          node.target_power_state = null;
        }
      );
    }

    function powerOnAll(selected) {
      service.operateAll(service.powerOn, selected);
    }

    function powerOffAll(selected) {
      service.operateAll(service.powerOff, selected);
    }

    // maintenance

    function promptForPutNodeInMaintenanceMode(node) {
      prompt({
        text: {
          title: gettext('(Optional) Why is this node under maintenance?'),
          submit: gettext('Submit'),
          cancel: gettext('Cancel'),
          placeholder: gettext('Maintenance reason')
        },
        maxlength: 256
      },
      function (reason) {
        putNodeInMaintenanceMode(node, reason);
      });
    }

    function putNodeInMaintenanceMode(node, reason) {
      if (node.maintenance !== false) {
        return;
      }
      node.maintenance = null;
      ironic.putNodeInMaintenanceMode(node.uuid, reason).then(
        function () {
          node.maintenance = true;
          node.maintenance_reason = reason;
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
          node.maintenance_reason = null;
        }
      );
    }

    function promptForPutAllInMaintenanceMode(selected) {
      prompt({
        text: {
          title: gettext('(Optional) Why are these nodes under maintenance?'),
          submit: gettext('Submit'),
          cancel: gettext('Cancel'),
          placeholder: gettext('Maintenance reason')
        },
        maxlength: 256
      },
      function (reason) {
        putAllInMaintenanceMode(selected, reason);
      });
    }

    function putAllInMaintenanceMode(selected, reason) {
      service.operateAll(function (node) {
        service.putNodeInMaintenanceMode(node, reason);
      }, selected);
    }

    function removeAllFromMaintenanceMode(selected) {
      service.operateAll(service.removeNodeFromMaintenanceMode, selected);
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
