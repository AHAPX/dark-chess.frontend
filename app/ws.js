'use strict';

angular.module('darkChess')
    .service('socketService', socketService);

    socketService.$inject = [
        '$rootScope',
    ];

    function socketService($rootScope) {
        var self = this;

        self.create = function(_reconnect) {
            var ws = new WebSocket('wss://api.dark-chess.com/ws'),
                reconnect = _reconnect || _reconnect != false,
                ping_timeout,
                queue = [],
                tags = [];

            var proxy = {
                onopen: null,
                onclose: null,
                onevent: null,
                opened: function(onopen) {
                    this.onopen = onopen;
                    return this;
                },
                closed: function(onclose) {
                    this.onclose = onclose;
                    return this;
                },
                onEvent: function(onevent) {
                    this.onevent = onevent;
                    return this;
                },
                send: function(message, json) {
                    var msg = message;
                    if (json) {
                        msg = angular.toJson(msg);
                    }
                    send(msg);
                },
                addTag: function(tag) {
                    if (tags.indexOf(tag) < 0) {
                        tags.push(tag);
                        setTags();
                    }
                },
                removeTag: function(tag) {
                    var index = tags.indexOf(tag);
                    if (index > -1) {
                        tags.splice(index, 1);
                        setTags();
                    }
                },
            };

            ws.onmessage = function(msg) {
                if (msg.data == 'ping') {
                    return send('pong');
                }
                if (msg.data == 'pong') {
                    return;
                }
                if (proxy.onevent && msg && msg.data) {
                    proxy.onevent(angular.fromJson(msg.data));
                }
                updatePingTimeout();
            };

            ws.onopen = function(event) {
                while (queue.length > 0) {
                    if (!send(queue.shift())) {
                        break;
                    }
                }
                setPingTimeout();
            };

            ws.onclose = function(event) {
                if (reconnect) {
                    clearPingTimeout();
                    setTimeout(function() { self.create(tags); }, 50000);
                }
            };

            function ping() {
                send('ping');
                setPingTimeout();
            }

            function setPingTimeout() {
                ping_timeout = setTimeout(ping, 50000);
            }

            function clearPingTimeout() {
                clearTimeout(ping_timeout);
            }

            function updatePingTimeout() {
                clearPingTimeout();
                setPingTimeout();
            }

            function send(msg) {
                if (ws.readyState == 1) {
                    ws.send(msg);
                    return true;
                }
                queue.push(msg);
            }

            function setTags() {
                send(angular.toJson({ 'tags': tags }));
            }

            return proxy;
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
        }
    };

