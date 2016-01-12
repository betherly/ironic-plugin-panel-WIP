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

  angular
      .module('horizon.dashboard.admin.ironic')
      .controller('IronicNodeListController', IronicNodeListController);

  IronicNodeListController.$inject = [
    '$scope',
    'horizon.app.core.openstack-service-api.ironic',
    'horizon.dashboard.admin.ironic.actions',
    'horizon.dashboard.admin.basePath'
  ];

  function IronicNodeListController($scope, ironic, actions, basePath) {
    var ctrl = this;

    ctrl.nodes = [];
    ctrl.checked = {};
    ctrl.basePath = basePath;

    $scope.nodes = ctrl.nodesSrc = [];
    $scope.actions = actions;

    $scope.$watchCollection('selected', function () {
      var selected = $scope.selected || {};
      selected.isEmpty = true;
      for (var key in selected) {
        if (selected[key].checked) {
          selected.isEmpty = false;
          return;
        }
      }
    });

    ctrl.init = init;

    ///////////////

    function init() {
      retrieveNodes();
    }

    function retrieveNodes() {
      return ironic.getNodes().then(onGetNotes);
    }

    function onGetNotes(response) {
      $scope.nodes = ctrl.nodesSrc = response.data.items;
      ctrl.nodesSrc.forEach(function (node) {
        node.id = node.uuid;
        retrievePorts(node);
        if (node['target_power_state']) {
          actions.updateNode(node);
        }
      });
    }

    function retrievePorts(node) {
      return ironic.getPortsWithNode(node.uuid).then(
        function (response) {
          node.ports = response.data.items;
        }
      );
    }
  }

})();
