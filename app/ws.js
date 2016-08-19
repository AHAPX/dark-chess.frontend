'use strict';

angular.module('darkChess')
    .service('socketService', socketService);

    socketService.$inject = [
        '$rootScope',
        '$timeout',
    ];

    function socketService($rootScope, $timeout) {
        var self = this,
            queue = [],
            tags = [];

        var TIMEOUTS = {
            ping: 5000,
            pong: 3000,
            reconnect: 3000,
        };

        self.alive = null;

        function connect() {
            var ws = new WebSocket('wss://api.dark-chess.com/ws'),
                ping_timeout,
                wait_pong = false;

            function send(message) {
                send(angular.toJson(message));
            }

            function addTag(tag) {
                if (tags.indexOf(tag) < 0) {
                    tags.push(tag);
                    setTags();
                }
            }

            function removeTag(tag) {
                var index = tags.indexOf(tag);
                if (index > -1) {
                    tags.splice(index, 1);
                    setTags();
                }
            }

            function checkPing() {
                if (wait_pong && self.alive != false) {
                    self.alive = false;
                    $rootScope.$broadcast('socketAlive');
                }
            }

            function ping() {
                wait_pong = true;
                send('ping');
                $timeout(checkPing, TIMEOUTS.pong);
                setPingTimeout();
            }

            function setPingTimeout() {
                ping_timeout = $timeout(ping, TIMEOUTS.ping);
            }

            function clearPingTimeout() {
                $timeout.cancel(ping_timeout);
            }

            function send(msg) {
                if (ws.readyState == 1) {
                    ws.send(msg);
                    return true;
                }
                if (msg != 'ping') {
                    queue.push(msg);
                }
            }

            function setTags() {
                send(angular.toJson({ 'tags': tags }));
            }

            ws.onmessage = function(msg) {
                if (msg.data == 'ping') {
                    return send('pong');
                }
                if (msg.data == 'pong') {
                    wait_pong = false;
                    if (self.alive != true) {
                        self.alive = true;
                        $rootScope.$broadcast('socketAlive');
                    }
                    return;
                }
                $rootScope.$broadcast('onSocket', angular.fromJson(msg.data));
            };

            ws.onopen = function(event) {
                ping();
                if (tags.length > 0) {
                    setTags();
                }
                while (queue.length > 0) {
                    if (!send(queue.shift())) {
                        break;
                    }
                }
                setPingTimeout();
            };

            ws.onclose = function(event) {
                clearPingTimeout();
                $timeout(connect, TIMEOUTS.reconnect);
            };

            $rootScope.$on('socketAddTag', function(event, tag) {
                addTag(tag);
            });

            $rootScope.$on('socketRemoveTag', function(event, tag) {
                removeTag(tag);
            });
        };

        self.signals = {
            none: 0x0000,
            start: 0x0001,
            move: 0x0002,
            end: 0x0010,
            win: 0x0011,
            lose: 0x0012,
            draw: 0x0013,
            draw_request: 0x0021,
        };

        connect();
    };

