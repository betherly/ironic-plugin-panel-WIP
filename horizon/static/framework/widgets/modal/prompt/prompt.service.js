/*
 * © Copyright 2015 Hewlett Packard Enterprise Development Company LP
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

  /**
   * @ngdoc service
   * @name horizon.framework.widgets.modal.prompt
   *
   * @description
   * Emulating browser's window.prompt function to provide a popup
   * dialog for user to input data.
   *
   * @param {object} params, the specification object for the popup dialog.
   * @param {object} callback, the callback function with user input.
   *
   * @example:
   ```js

   prompt({
     text: {
       title: gettext('Please input data'),
       submit: gettext('Ok'),
       cancel: gettext('Cancel'),
       placeholder: gettext('Input data')
     },
     required: true
   },
   function (input) {
     // ...
   });

   ```
   */

  angular
    .module('horizon.framework.widgets.modal')
    .factory('horizon.framework.widgets.modal.prompt', serviceFactory)
    .controller('horizon.framework.widgets.modal.PromptController', PromptController);

  serviceFactory.$inject = [
    '$modal',
    'horizon.framework.widgets.basePath'
  ];

  function serviceFactory($modal, basePath) {
    return prompt;

    function prompt(params, callback) {
      $modal.open({
        controller: 'horizon.framework.widgets.modal.PromptController',
        templateUrl: basePath + 'modal/prompt/prompt.html',
        resolve: {
          context: function() {
            params.callback = callback;
            return params;
          }
        }
      });
    }
  }

  PromptController.$inject = ['$scope', '$modalInstance', 'context'];

  function PromptController($scope, $modalInstance, context) {
    $scope.submit = submit;
    $scope.cancel = cancel;
    $scope.context = context || {};

    function submit(input) {
      context.callback(input);
      $modalInstance.close();
    }

    function cancel() {
      $modalInstance.dismiss('cancel');
    }
  }

})();
