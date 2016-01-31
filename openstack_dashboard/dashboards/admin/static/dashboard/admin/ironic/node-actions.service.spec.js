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

  describe('horizon.dashboard.admin.ironic.node-actions', function () {
    var nodeActions, ironic, longRunningService, nodes, longRunningMock, prompt, promptMock, selected;

    beforeEach(function () {
      longRunningMock = jasmine.createSpy('longRunningMock')
        .and
        .returnValue({
          until: function () {
            return {
              then: function () {}
            };
          }
        });
      promptMock = jasmine.createSpy('promptMock');

      module('templates');
      module('horizon.framework.widgets');
      module('horizon.app.core.openstack-service-api');
      module('horizon.dashboard.admin.ironic');
      module(function ($provide) {
        $provide.value('hz.framework.long-running.service', longRunningMock);
        $provide.value('horizon.framework.widgets.modal.prompt', promptMock);
      });
    });

    beforeEach(inject(function ($injector) {
      nodeActions = $injector.get('horizon.dashboard.admin.ironic.actions');
      spyOn(nodeActions, 'operateAll').and.callThrough();

      ironic = $injector.get('hz.api.ironic');
      spyOn(ironic, 'getNodes').and.returnValue({ then: function () {} });
      spyOn(ironic, 'getNode').and.returnValue({ then: function () {} });
      spyOn(ironic, 'getPortsWithNode').and.returnValue({ then: function () {} });
      spyOn(ironic, 'putNodeInMaintenanceMode').and.returnValue({ then: function () {} });
      spyOn(ironic, 'removeNodeFromMaintenanceMode').and.returnValue({ then: function () {} });
      spyOn(ironic, 'powerOnNode').and.returnValue({ then: function () {} });
      spyOn(ironic, 'powerOffNode').and.returnValue({ then: function () {} });

      longRunningService = $injector.get('hz.framework.long-running.service');
      prompt = $injector.get('horizon.framework.widgets.modal.prompt');

      nodes = [
        { id: 123, uuid: 123, power_state: 'power off' },
        { id: 456, uuid: 456, power_state: 'power on' }
      ];

      selected = {
        '123': {
          item: nodes[0],
          checked: true
        },
        '456': {
          item: nodes[1],
          checked: true
        }
      };

    }));

    it('should be defined.', function () {
      expect(nodeActions).toBeDefined();
    });

    it('should have API `powerOn` defined and working.', function () {
      expect(nodeActions.powerOn).toBeDefined();

      nodeActions.powerOn(nodes[1]);
      expect(ironic.powerOnNode).not.toHaveBeenCalledWith(nodes[1].uuid);

      nodeActions.powerOn(nodes[0]);
      expect(ironic.powerOnNode).toHaveBeenCalledWith(nodes[0].uuid);
      expect(nodes[0].power_state).toBe(null);
      expect(nodes[0].target_power_state).toBe('power on');
    });

    it('should have API `powerOff` defined and working.', function () {
      expect(nodeActions.powerOff).toBeDefined();

      nodeActions.powerOff(nodes[0]);
      expect(ironic.powerOffNode).not.toHaveBeenCalledWith(nodes[0].uuid);

      nodeActions.powerOff(nodes[1]);
      expect(ironic.powerOffNode).toHaveBeenCalledWith(nodes[1].uuid);
      expect(nodes[1].power_state).toBe(null);
      expect(nodes[1].target_power_state).toBe('power off');
    });

    it('should have API `powerOnAll` defined and working.', function () {
      spyOn(nodeActions, 'powerOn');
      expect(nodeActions.powerOnAll).toBeDefined();
      nodeActions.powerOnAll(selected);
      expect(nodeActions.operateAll).toHaveBeenCalled();
      expect(nodeActions.powerOn.calls.count()).toEqual(2);
    });

    it('should have API `powerOffAll` defined and working.', function () {
      spyOn(nodeActions, 'powerOff');
      expect(nodeActions.powerOffAll).toBeDefined();
      nodeActions.powerOffAll(selected);
      expect(nodeActions.operateAll).toHaveBeenCalled();
      expect(nodeActions.powerOff.calls.count()).toEqual(2);
    });

    it('should have API `promptForPutNodeInMaintenanceMode` defined and working.', function () {
      expect(nodeActions.promptForPutNodeInMaintenanceMode).toBeDefined();
      nodeActions.promptForPutNodeInMaintenanceMode(nodes[0]);
      expect(prompt).toHaveBeenCalled();
    });

    it('should have API `putNodeInMaintenanceMode` defined and working.', function () {
      expect(nodeActions.putNodeInMaintenanceMode).toBeDefined();

      var node = nodes[0];
      node.maintenance = true;
      nodeActions.putNodeInMaintenanceMode(node);
      expect(ironic.putNodeInMaintenanceMode).not.toHaveBeenCalled();

      node.maintenance = false;
      nodeActions.putNodeInMaintenanceMode(node, 'some reason');
      expect(ironic.putNodeInMaintenanceMode).toHaveBeenCalledWith(node.uuid, 'some reason');
      expect(node.maintenance).toBe(null);
    });

    it('should have API `removeNodeFromMaintenanceMode` defined and working.', function () {
      expect(nodeActions.removeNodeFromMaintenanceMode).toBeDefined();

      var node = nodes[0];
      node.maintenance = false;
      nodeActions.removeNodeFromMaintenanceMode(node);
      expect(ironic.removeNodeFromMaintenanceMode).not.toHaveBeenCalled();

      node.maintenance = true;
      nodeActions.removeNodeFromMaintenanceMode(node);
      expect(ironic.removeNodeFromMaintenanceMode).toHaveBeenCalledWith(node.uuid);
      expect(node.maintenance).toBe(null);
    });

    it('should have API `promptForPutAllInMaintenanceMode` defined and working.', function () {
      expect(nodeActions.promptForPutNodeInMaintenanceMode).toBeDefined();
      nodeActions.promptForPutAllInMaintenanceMode(nodes);
      expect(prompt).toHaveBeenCalled();
    });

    it('should have API `putAllInMaintenanceMode` defined and working.', function () {
      spyOn(nodeActions, 'putNodeInMaintenanceMode');
      expect(nodeActions.putAllInMaintenanceMode).toBeDefined();
      nodeActions.putAllInMaintenanceMode(selected);
      expect(nodeActions.operateAll).toHaveBeenCalled();
      expect(nodeActions.putNodeInMaintenanceMode.calls.count()).toEqual(2);
    });

    it('should have API `removeAllFromMaintenanceMode` defined and working.', function () {
      spyOn(nodeActions, 'removeNodeFromMaintenanceMode');
      expect(nodeActions.removeAllFromMaintenanceMode).toBeDefined();
      nodeActions.removeAllFromMaintenanceMode(selected);
      expect(nodeActions.operateAll).toHaveBeenCalled();
      expect(nodeActions.removeNodeFromMaintenanceMode.calls.count()).toEqual(2);
    });

    it('should have API `updateNode` defined and working.', function () {
      expect(nodeActions.updateNode).toBeDefined();
      nodeActions.updateNode(nodes[0]);
      expect(longRunningService).toHaveBeenCalled();
    });
  });

})();
