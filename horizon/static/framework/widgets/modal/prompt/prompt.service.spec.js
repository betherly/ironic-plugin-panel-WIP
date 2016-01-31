/*
 * Copyright 2015 Hewlett Packard Enterprise Development Company LP
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function () {
  'use strict';

  describe('prompt service', function () {
    var prompt, scope, ctrl, modalInstance, context;

    beforeEach(module('templates'));
    beforeEach(module('ui.bootstrap'));
    beforeEach(module('horizon.framework'));

    beforeEach(inject(function ($injector, $controller) {
      prompt = $injector.get('horizon.framework.widgets.modal.prompt');
      scope = $injector.get('$rootScope').$new();

      modalInstance = {
        close: function () {},
        dismiss: function () {}
      };

      context = {
        callback: function (input) {}
      };

      ctrl = $controller('horizon.framework.widgets.modal.PromptController', {
        $scope: scope,
        $modalInstance: modalInstance,
        context: context
      });
    }));

    it ('is defined as function', function () {
      expect(angular.isFunction(prompt)).toBe(true);
    });

    it('establishes a controller', function () {
      expect(ctrl).toBeDefined();
    });

    it('sets context on the scope', function () {
      expect(scope.context).toBeDefined();
    });

    it('sets action functions', function () {
      expect(scope.submit).toBeDefined();
      expect(scope.cancel).toBeDefined();
    });

    it('makes submit invoke callback function', function () {
      expect(scope.submit).toBeDefined();
      spyOn(context, 'callback');
      scope.submit('something');
      expect(context.callback).toHaveBeenCalledWith('something');
    });

    it('makes submit close the modal instance', function () {
      expect(scope.submit).toBeDefined();
      spyOn(modalInstance, 'close');
      scope.submit('something');
      expect(modalInstance.close.calls.count()).toBe(1);
    });

    it('makes cancel close the modal instance', function () {
      expect(scope.cancel).toBeDefined();
      spyOn(modalInstance, 'dismiss');
      scope.cancel();
      expect(modalInstance.dismiss).toHaveBeenCalledWith('cancel');
    });
  });

})();
