/**
 * @author Gordon from Blumberg
 * @description Templates for battlefields
 * @version 1.0.0
 */


define(['GBL', 'battlefield'], function (gbl, bf) {
    "use strict";

    var templates = {},
        bf_proto = bf.Battlefield.prototype;
    templates.name = 'templates.js';
    templates.version = '1.0.0';

    // - - Configuration - -
    bf_proto.hexQuarter = 20;
    bf_proto.hexWidth = 70;
    bf_proto.focus = 800;

    templates.run = function (temp) {
        temp = temp || {};
        if (gbl.getType(temp) == 'String') {
            if (this[temp]) return this[temp]();
            else temp = {};
        }
        temp.gridShape = temp.gridShape || 'rad';
        temp.gridSize = temp.gridSize || 6;
        temp.gridSrc = temp.gridShape + '-' + temp.gridSize + '.png';
        temp.obstaclesDensity = temp.obstaclesDensity || 2;
        temp.landscape = temp.landscape || 'random';

        this[temp.gridShape](temp.gridSize);
    };
    templates.rad = function (r) {
        var i, j, bfCur = this.bfCur;
        bfCur.minY = -r;
        bfCur.maxY = r;
        bfCur.coordsOfStart = {
            x: 0,
            y: 3 * bfCur.hexQuarter * r
        };
        bfCur.gridRadius = (2 * r + 1) * bfCur.hexWidth / 2;
        bfCur.gridWidth = (2 * r + 1) * bfCur.hexWidth;
        bfCur.gridHeight = (6 * r + 4) * bfCur.hexQuarter;
        for (i = r; i >= -r; i--) {
            bfCur[i] = {
                minX: i > 0 ? 0 : -i,
                maxX: i < 0 ? 2 * r : 2 * r - i
            };
            for (j = bfCur[i].minX; j <= bfCur[i].maxX; j++) {
                bfCur[i][j] = new bf.Hex(j, i);
            }
        }
        bfCur.centralHex = bfCur[0][r];

    };
    templates.rect = function (s) {
        var i, j, bfCur = this.bfCur, w, h, _x, _y;
        s = s.split('*');
        w = +s[0];
        h = +s[1];
        bfCur.minY = 0;
        bfCur.maxY = h - 1;
        bfCur.coordsOfStart = {
            x: 0,
            y: 3 * bfCur.hexQuarter * (h - 1)
        };
        //bf.gridRadius=(2*r+1)*bf.hexWidth/2;    <-- think about this!!!
        bfCur.gridWidth = (w + .5) * bfCur.hexWidth;
        bfCur.gridHeight = (3 * h + 1) * bfCur.hexQuarter;
        for (i = 0; i < h; i++) {
            bfCur[i] = {
                minX: -(i / 2 ^ 0),
                maxX: h - 1 - (i / 2 ^ 0)
            };
            for (j = bfCur[i].minX; j <= bfCur[i].maxX; j++) {
                bfCur[i][j] = new bf.Hex(j, i);
            }
        }
        _y = (h - 1) / 2 ^ 0;
        _x = (w - 1) / 2 ^ 0;
        bfCur.centralHex = bfCur[_y][_x + bfCur[_y].minX];
    };
    templates.createWall = function (src) {
        var bf = this.bfCur,
            r = bf.gridRadius,
            pi = Math.PI,
            c = Math.ceil(2 * pi * r / 180),
            wall = mGB(), i,
            dx = bf.gridWidth / 2,
            dy = bf.gridHeight / 2;
        wall.width = gbl.round(2 * r * Math.tan(pi / c));
        wall.src = src;
        for (i = 0; i < c; i++) {
            wall.push(
                cE('div', {
                    style: {backgroundPosition: (i * wall.width) + 'px 0'},
                    angle: 360 * i / c,
                    x: round(Math.cos(2 * pi * i / c) * r + dx),
                    y: round(-Math.sin(2 * pi * i / c) * r + dy),
                    className: 'bf-wall'
                })[0]
            );
        }
        return wall.insertTo('.battlefield')
    };
    templates.grass = function (temp) {
        var n = getRandom([3, 3, 1]) + 1;
        temp.groundSrc = 'grass' + (n < 10 ? '0' + n : n);
        this.createEnvSprites('tree');
    };
    templates.random = function (temp) {

    };
    templates.createEnvSprites = function (type) {

    };

    gbl._downloadReport(templates);
}(GBL, mGB, createElement, GBL.game.battlefield));