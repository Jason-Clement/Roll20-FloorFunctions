var FloorFunctions = FloorFunctions || (function () {
    'use_strict';

    var version = '1.0',
        releaseDate = '2017-10-22',
        ff,

        checkInstall = function () {
            log('Floor Functions Script Installed: Version: ' + version + ' Released: ' + releaseDate);
            if (!state.FloorFunctions)
                state.FloorFunctions = {
                    currentFloor: 1,
                    tokens: {},
                    backgrounds: {}
                };
            ff = state.FloorFunctions;
        },

        command = function(c, f, p, h) {
            this.command = c;
            this.function = f;
            this.params = p;
            this.help = h;
            this.fullHelp = function() {
                return '<br><strong>' + this.command + '</strong>'
                    + (this.params.length === 0 ? '' : ' ' + _.map(this.params, p => '[' + p + ']').join(' '))
                    + ' ' + this.help;
            }
        },

        activateCommand = function(command, a, objs) {
            switch (command) {
                case '!ffhelp':   ffhelp(); break;
                case '!ffinfo':   ffinfo(a, objs); break;
                case '!ffadd':    ffadd(a, objs); break;
                case '!ffremove': ffremove(a, objs); break;
                case '!ffset':    ffset(a); break;
                case '!ffshow':   ffshow(a); break;
                case '!ffhide':   ffhide(a); break;
            }
        },

        commands = [
            new command('!ffhelp',   [],                      'displays this help text'),
            new command('!ffinfo',   [],                      'if objects are selected, displays the object\'s current floor and layer, otherwise displays a list of all floors'),
            new command('!ffadd',    ['floor name', 'layer'], 'adds the selected objects to the specified floor on their current layer unless one is specified through the [layer] parameter (must be one of map, objects, gmlayer, or walls)'),
            new command('!ffremove', [],                      'removes the selected tokens from all floors'),
            new command('!ffset',    ['floor name'],          'brings the specified floor into view and hides all other floors'),
            new command('!ffshow',   ['floor name'],          'brings the specified floor into view and to the front'),
            new command('!ffhide',   ['floor name'],          'hides the specified floor'),
        ],

        notify = function (msg) {
            var s = '';
            if (_.isArray(msg)) {
                sendChat('Floor Functions', '/w gm <div>' + msg.join('<br>') + '</div>');
                _.each(msg, function(what) {
                    log(what);
                });
            } else {
                sendChat('Floor Functions', '/w gm <div>' + msg + '</div>');
                log(msg);
            }
        },

        checkPageBackground = function (p) {
            var o = findObjs({ _type: 'page', _id: p });
            if (!o || o.length < 1) return;
            var page = o[0];
            var w = page.get('width') * 70;
            var h = page.get('height') * 70;
            if (ff.backgrounds[p]) {
                var b = findObjs({ _id: ff.backgrounds[p] });
                if (b && b.length == 1) {
                    if (b[0].get('fill') == page.get('background_color') &&
                        b[0].get('width') == w &&
                        b[0].get('height') == h &&
                        b[0].get('top') == w / 2 &&
                        b[0].get('left') == h / 2)
                        return;
                }
            }
            var g = createObj('path', {
                pageid: page.get('_id'),
                layer: 'map',
                top: h / 2,
                left: w / 2,
                width: w,
                height: h,
                path: JSON.stringify([
                    ['M', 0, 0],
                    ['L', w, 0],
                    ['L', w, h],
                    ['L', 0, h],
                    ['L', 0, 0]
                ]),
                fill: page.get('background_color'),
                stroke_width: 0
            });
            ff.backgrounds[p] = g.get('_id');
            toBack(g);
            _.each(ff.tokens, function (what) {
                if (what.floor != ff.currentFloor) {
                    var t = findObjs({ _id: what.id });
                    if (t && t.length == 1) {
                        what.set('layer', 'map');
                        toBack(what);
                    }
                }
            });
            log('Background path for page ' + p + ' has been created');
        },

        token = function (id, floor, layer) {
            this.id = id;
            this.floor = floor;
            this.layer = layer;
        },
        
        checkForArg = function(a, i, name) {
            if (a.length >= i)
                return true;
            notify('The ' + name + ' is missing');
            return false;
        },

        ffhelp = function() {
            var s = _.map(commands, c => c.fullHelp());
            s.unshift('Floor Functions simulates having layers by allowing tokens, maps, or lighting lines to be assigned to a named floor and then allowing the various floors to be manipulated via chat commands.');
            notify(s);
        },

        ffinfo = function(a, objs) {
            s = [];
            if (objs && objs.length > 0) {
                _.each(objs, function(what) {
                    if (ff.tokens[what._id]) {
                        var t = ff.tokens[what._id];
                        s.push('floor: ' + t.floor + ' - layer: ' + t.layer);
                    } else {
                        s.push('Token not registered');
                    }
                });
            } else {
                x = {};
                _.each(ff.tokens, function(what) {
                    if (x[what.floor])
                        x[what.floor]++;
                    else
                        x[what.floor] = 1;
                });
                for (var z in x)
                    s.push('floor ' + z + ' - ' + x[z] + ' objects');
            }
            notify(s);
        },

        ffset = function (a) {
            if (!checkForArg(a, 1, 'floor name')) return;
            var name = a[1];
            _.each(ff.tokens, function (t) {
                if (t.floor == name) {
                    _.each(findObjs({ _id: t.id }), function (o) {
                        o.set('layer', t.layer);
                        toFront(o);
                    });
                } else {
                    _.each(findObjs({ _id: t.id }), function (o) {
                        o.set('layer', 'map');
                        toBack(o);
                    });
                }
            });
            ff.currentFloor = name;
            notify('Floor set to ' + name);
        },

        ffhide = function (a) {
            if (!checkForArg(a, 1, 'floor name')) return;
            var name = a[1];
            _.each(ff.tokens, function (t) {
                if (t.floor == name) {
                    _.each(findObjs({ _id: t.id }), function (o) {
                        o.set('layer', 'map');
                        toBack(o);
                    });
                }
            });
            notify('Floor ' + name + ' has been hidden');
        },

        ffshow = function (a) {
            if (!checkForArg(a, 1, 'floor name')) return;
            var name = a[1];
            _.each(ff.tokens, function (t) {
                if (t.floor == name) {
                    _.each(findObjs({ _id: t.id }), function (o) {
                        o.set('layer', t.layer);
                        toFront(o);
                    });
                }
            });
            notify('Floor ' + name + ' has been shown');
        },

        ffadd = function (a, objs) {
            if (objs.length === 0) return;
            if (!checkForArg(a, 1, 'floor name')) return;
            var name = a[1];
            var specLayer = '';
            if (a.length > 2)
                specLayer = tSplit[2].toLowerCase();
            if (specLayer !== 'map' && specLayer !== 'objects' && specLayer !== 'gmlayer' && specLayer !== 'walls')
                specLayer = '';
            var n = [];
            _.each(objs, function (what) {
                var o = findObjs({ _id: what._id });
                if (o && o.length > 0) {
                    checkPageBackground(o.get('_pageid'));
                    var layer = specLayer;
                    if (layer === '')
                        var layer = o.get('layer');
                    var id = o.get('_id');
                    ff.tokens[id] = new token(id, name, layer);
                    n.push('Added ' + o.get('_type') + ' to floor ' + f + ' on the ' + layer + ' layer');
                }
            });
            if (n.length > 0) notify(n);
        },

        ffremove = function (a, objs) {
            var n = [];
            _.each(objs, function (what) {
                var o = findObjs({ _id: what._id });
                if (ff.tokens[o.get('_id')]) {
                    delete ff.tokens[o.get('_id')];
                    n.push('Removed ' + o.get('_type'));
                }
            });
            if (n.length > 0) notify(n);
        },

        onMessage = function (msg) {
            if (msg.type == 'api') { // && playerIsGM(msg.playerid)) {
                if (msg.content.toLowerCase().substr(0, 3) !== '!ff')
                    return;
                var args = msg.content.split(' ');
                var objs = msg.selected;
                var com = args[0].toLowerCase();
                _.each(commands, function(command) {
                    if (com === command.command) {
                        activateCommand(com, args, objs);
                    }
                });
            }
        },

        registerEvents = function () {
            on('chat:message', onMessage);
        };

    return {
        CheckInstall: checkInstall,
        RegisterEvents: registerEvents,
    };

}());

on('ready', function () {
    'use strict';
    FloorFunctions.CheckInstall();
    FloorFunctions.RegisterEvents();
});