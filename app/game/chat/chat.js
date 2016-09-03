'use strict';

angular.module('darkChess.game')
    .directive('chat', chatDirective);

    chatDirective.$inject = [
        '$timeout',
        'apiService',
    ];

    function chatDirective($timeout, apiService) {

        function linker(scope, elem, attrs) {

            scope.model = {
                text: '',
            };

            scope.messages = [];
            scope.blocked = false;
            scope.load_blocked = false;
            scope.last_dt = null;

            function scrollBottom() {
                var obj = angular.element('#messages');
                obj.scrollTop(obj.prop('scrollHeight'));
            }

            function addMessage(message, end) {
                message.created_at = new Date(message.created_at);
                message.created_ago = (new Date() - message.created_at) / 1000;
                if (end) {
                    scope.messages.push(message);
                } else {
                    scope.messages.unshift(message);
                }
            }

            function messageExists(message) {
                var created_at = new Date(message.created_at);
                for (var i=scope.messages.length-1; i > -1; i--) {
                    if (scope.messages[i].created_at < created_at) {
                        break;
                    }
                    if (scope.messages[i].created_at.getTime() === created_at.getTime() &&
                            scope.messages[i].text === message.text) {
                        return true;
                    }
                }
            }

            scope.send = function() {
                if (!scope.model.text.length || scope.model.text.length < 1) {
                    return;
                }
                scope.blocked = true;
                apiService.chat.add(scope.model.text)
                    .then(function(data) {
                        if (!messageExists(data.message)) {
                            addMessage(data.message, true);
                        }
                        scope.model.text = '';
                        scope.blocked = false;
                        $timeout(function() {
                            angular.element('#text').focus();
                            scrollBottom();
                            scope.last_dt = null;
                        }, 100);
                    }, function(error) {
                        console.log(error);
                        scope.blocked = false;
                    });
            };

            scope.loadMessages = function(init) {
                scope.load_blocked = true;
                var offset = init ? 0 : scope.messages.length;
                return apiService.chat.messages(offset)
                    .then(function(data) {
                        if (init) {
                            scope.messages = [];
                        }
                        $.each(data.messages, function(index, message) {
                            addMessage(message);
                        });
                        scope.load_blocked = false;
                        if (init) {
                            if (scope.messages.length > 0) {
                                var df = scope.messages[scope.messages.length -1].created_ago;
                                if (df > 5 * 60) {
                                    scope.last_dt = df;
                                }
                            }
                            $timeout(scrollBottom, 100);
                        }
                        return;
                    }, function(error) {
                        scope.load_blocked = false;
                    });
            };

            scope.$on('chat_message', function(event, message) {
                if (messageExists(message.message)) {
                    return;
                }
                addMessage(message.message, true);
                scope.last_dt = null;
                $timeout(scrollBottom, 100);
            });

            scope.loadMessages(true);
        }

        return {
            link: linker,
            templateUrl: 'app/game/chat/chat.html',
            restrict: 'E',
            scope: false,
        };
    }
