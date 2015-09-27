/**
 * @author Gordon from Blumberg
 * @description Hexgrid module
 * @version 1.0.0
 */

define(['GBL'],function(gbl) {
    "use strict";

    var hg={
        name: 'hexgrid.js',
        version: '1.0.0'
    };
    
    hg.Hexgrid=function Hexgrid(opts) {
        var that=this;
        this.allHexes= new hg.HexCollection('all');
        this.lastHexes=new hg.HexCollection('last');
        this.thisPublic={
            allHexes:this.allHexes,
            lastHexes:this.lastHexes,
            getHex:function(y,x) {
                return that[y]&&that[y][x]||null
            }
        };
        this.generateHexgrid(opts.template);
        this.callMethods('findNeighbors');
    };
    
    hg.Hexgrid.prototype={
        constructor: hg.Hexgrid,
        generateHexgrid: function (temp) {
            var tempSplit,
                templates= {
                    rad: function (r) {
                        var i, j;
                        r = +r || 6;
                        this.minY = -r;
                        this.maxY = r;

                        for (i = this.maxY; i >= this.minY; i--) {
                            this[i] = {
                                minX: i > 0 ? 0 : -i,
                                maxX: i < 0 ? 2 * r : 2 * r - i
                            };
                            for (j = this[i].minX; j <= this[i].maxX; j++) {
                                this[i][j] = new hg.Hex(j, i, this.thisPublic);
                            }
                        }
                        this.centralHex = this[0][r];
                        this.startHexes = new hg.HexCollection('start').push(
                            this[0][2 * r],
                            this[r][r],
                            this[r][0],
                            this[0][0],
                            this[-r][r],
                            this[-r][2 * r]
                        )
                    }
                };

            temp = temp || {};
            if (typeof temp == 'string') {
                tempSplit = temp.split('-');
                if (gbl.isFunction(templates[tempSplit[0]])) {
                    temp={
                        gridShape:tempSplit[0],
                        gridSize:tempSplit[1]
                    }
                } else {
                    console.log('Warning! Battlegrid template ' + tempSplit[0] + ' is not defined!');
                    temp = {};
                }
            }
            this.templateData={
                gridShape:temp.gridShape=temp.gridShape||'rad',
                gridSize:temp.gridSize=temp.gridSize||6
            };
            templates[temp.gridShape].call(this, temp.gridSize);
        },
        callMethods: function () {
            this.allHexes.callMethods(arguments);
            return this
        },
        each:function(func) {
            this.allHexes.each(func);
            return this
        }
    };
    
    hg.Hex=function Hex(x, y,hg) {
        this.x = x;
        this.y = y;
        (this.hgCur=hg).allHexes.push(this);
    };
    
    hg.Hex.prototype= {
        constructor: hg.Hex,
        coorShifts: [[0, 1], [1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1]],
        findNeighbors: function () {
            var hgCur = this.hgCur,
                x = this.x, y = this.y,
                csh = this.coorShifts, i;

            this.neighbors = new hg.HexCollection('neighbors');
            for (i = 0; i < 6; i++) {
                this.neighbors.push(this[i] = hgCur.getHex(y + csh[i][0], x + csh[i][1]) || (this.isLast = 1, null));
            }

            if (this.isLast) {
                hgCur.lastHexes.push(this)
            } else {
                this.isLast = 0
            }
        },
        getDistance: function (to) {
            var dx = to.x - this.x,
                dy = to.y - this.y;

            if (dx * dy > 0) {
                return Math.abs(dx + dy)
            }
            return Math.max(Math.abs(dx), Math.abs(dy))
        },
        getVector: function (to) {
            var dx = to.x - this.x,
                dy = to.y - this.y,
                cmpns = {},
                d1, d2, dd, sts;

            if (dx == 0 && dy == 0) {
                cmpns[0] = 0;
                cmpns.dirList = [0];
                return cmpns
            }
            if (dy) {
                cmpns[d1 = (dy > 0 ? 1 : 4)] = Math.abs(dy)
            }
            if (dx) {
                cmpns[d2 = (dx > 0 ? 0 : 3)] = Math.abs(dx)
            }
            if (dx * dy && (dd = Math.abs(d1 - d2)) != 1) {
                sts = Math.min(cmpns[d1], cmpns[d2]);
                cmpns[d1] -= sts;
                cmpns[d2] -= sts;
                cmpns[dd == 4 ? 5 : 2] = sts;
            }
            cmpns.dirList = [];
            cmpns.forOwn(function (dir) {
                this[dir] && !isNaN(+dir) && this.dirList.push(+dir);
            });
            return cmpns;
        },
        isStraight: function (to) {
            var dy = to.y - this.y,
                dx = to.x - this.x;
            return dy * dx === 0 || dy + dx === 0;
        },

        /*Returns polar coordinates
        * returned object contains next properties:
        * r: integer, distance,
        * fiHex: integer, polar angle in hexes,
        * fiDeg: number, polar angle in degrees*/
        getPolar: function (hex) {
            var vector = this.getVector(hex),
                polar = {r:0,fiHex:0,fiDeg:0},
                dr, dl;

            if (hex==this) {return polar}

            if (vector.dirList.length == 1) {
                dr = vector.dirList[0];
                polar.r = vector[dr];
                polar.fiHex = polar.r * dr;
                polar.fiDeg = gbl.round(polar.fiHex * 60 / polar.r,3);
            } else {
                dr = this.getRight(vector.dirList[0], vector.dirList[1]);
                dl = dr == vector.dirList[0] ? vector.dirList[1] : vector.dirList[0];
                polar.r = vector[dr] + vector[dl];
                polar.fiHex = polar.r * dr + vector[dl];
                polar.fiDeg = gbl.round(polar.fiHex * 60 / polar.r,3);
            }
            return polar;
        },
        prevDir: function (dir) {
            return !dir ? 5 : dir - 1
        },
        nextDir: function (dir) {
            return dir == 5 ? 0 : dir + 1
        },
        getRight: function (d1, d2) {
            var d = Math.abs(d1 - d2);
            switch (d) {
                case 0:
                case 3:
                    return d1;
                case 1:
                case 2:
                    return Math.min(d1, d2);
                case 4:
                case 5:
                    return Math.max(d1, d2);
            }
        },
        markLee: function (unwanted, finish) {
            var hgCur = this.hgCur,
                forbidden = new hg.HexCollection(hgCur.obstacles)
                    .push(hgCur.allHexes.filter('isBusy')),
                mark = 'lee_' + this.y + '_' + this.x,
                hcOpts = {type: 'izodist', mark: mark, prev: new hg.HexCollection(this)},
                i;

            if (unwanted) {
                forbidden.collectForbidden(hgCur, unwanted)
            }

            this[mark] = i = 0;
            this.markLeeData = {
                markName: mark,
                izodists: [hcOpts.prev],
                forbidden: forbidden
            };
            hcOpts.forbidden = forbidden;
            while (++i) {
                hcOpts.markValue = i;
                this.markLeeData.izodists.push(new hg.HexCollection(hcOpts));
                hcOpts.prev = this.markLeeData.izodists[i];
                if (!this.markLeeData.izodists[i].length || this.markLeeData.izodists[i].has(finish)) {
                    if (!this.markLeeData.izodists[i].length) {
                        this.markLeeData.izodists.pop()
                    }
                    break;
                }
            }
            return this
        },
        unmarkLee: function () {
            if (!this.markLeeData) {
                return this
            }
            this.hgCur.allHexes.deleteProperty(this.markLeeData.markName);
            delete this.markLeeData;
            return this;
        },
        getPath: function (to, unwanted) {
            var hgCur = this.hgCur,
                forbidden;
            if (!this.markLeeData) {
                this.markLee(unwanted, to)
            }
            else if (unwanted) {
                forbidden = new hg.HexCollection(hgCur.obstacles)
                    .push(hgCur.allHexes.filter('isBusy'))
                    .collectForbidden(hgCur, unwanted);
                if (!forbidden.isEqual(this.markLeeData.forbidden)) {
                    this.unmarkLee().markLee(unwanted, to)
                }
            }

            return new hg.Path(this, to)
        },

        getHidden:function(hc,maxRadius,targetHC) {
            var initHex=this,
                hidden=new hg.HexCollection({type:'hidden'}),
                hcOpts={type:'ring',centralHex:initHex},
                hids=new hg.HiddenSectors(this,hc),
                parts={l:0,r:0};

            (gbl.getType(targetHC)=='HexCollection'?targetHC
                :this.getHexesByDistance(hids.minDistance+1,maxRadius))
                .each(function() {
                    var hex=this,
                        polar=initHex.getPolar(this),
                        aw,l,r,
                        part;

                    if (!polar.r) {return}
                    aw=hids.rnd2(60/polar.r);
                    l=hids.rnd2(polar.fiDeg+aw/2);
                    r=hids.getPart(hids.rnd2(polar.fiDeg-aw/2));

                    parts.r=parts.l=0;
                    hids.each(function() {
                        if (polar.r<=this.distance) {return}
                        if (this.isInside(l)) {
                            part = hids.getPart(hids.rnd2((l - this.right) / aw));
                            if (!parts.l || parts.l < part) {
                                parts.l = part
                            }
                        }

                        if (this.isInside(r)) {
                            part = hids.getPart(hids.rnd2((this.left - r) / aw));
                            if (!parts.r || parts.r < part) {
                                parts.r = part
                            }
                        }

                        if (parts.l + parts.r > .5) {
                            hidden.push(hex);
                            return false
                        }
                    });
                });

            return hidden
        },

        getHexesByDistance:function(min,max) {
            var hex=this;
            min=min||1;
            return this.hgCur.allHexes.filter(max
                ? function () {
                    var d=hex.getDistance(this);
                    return min<=d&&d<=max
                }
                :function() {return min<=hex.getDistance(this)}
            )
        }
    };    
    
    hg.HexCollection=function HexCollection(opts) {  //Без аргументов - создается пустой объект
            this.all = [];               //переданный объект должен иметь свойства type
            if (opts == undefined) {
                this.type = 'none';
                return this;
            }
            if (gbl.getType(opts).has('Hex')) {
                if (gbl.getType(opts) == 'HexCollection' && arguments.length == 1) {
                    return opts
                }
                if (this.type) {this.type='none'}
                return this.push(arguments);
            }
            if (typeof opts == 'string') {
                opts = {type: opts}
            }
            if (gbl.isArray(opts)) {
                return HexCollection.apply(this, opts)
            }
            if (!gbl.isFunction(HexCollection.types[opts.type])&&!HexCollection.simpleTypes.has(opts.type)) {
                console.log('Warning! "' + opts.type + '" is unknown HexCollection type!');
                opts.type = 'none';
            }
            this.type = opts.type;
            return HexCollection.simpleTypes.has(this.type)
                ?this
                :HexCollection.types[this.type].call(this, opts);
        }.inherit(gbl.Collection);

    hg.HexCollection.types= {
        line: function (opts) {
            var hgCur=opts.from.hgCur,
                vector, csh = this.coorShifts,
                x, y,
                i, len;
            this.from = this.all[0] = opts.from;
            if (gbl.getType(opts.to) == 'Hex') {
                vector = this.from.getVector(opts.to);
                if (!this.from.isStraight(opts.to)) {
                    console.log('Line may not be drawn from ' + this.from.y + ',' + this.from.x + ' to ' + opts.to.y + ',' + opts.to.x + '!');
                    return this;
                } else {
                    this.to = opts.to;
                    this.direction = vector.dirList[0];
                    len = vector[this.direction] + 1;
                }
            } else {
                this.direction = opts.direction;
                len = opts.length;
            }
            for (i = 1; i < len; i++) {
                y = this.from.y + csh[this.direction][0] * i;
                x = this.from.x + csh[this.direction][1] * i;
                this.push(hgCur.getHex(y,x));
            }
            this.to = this.to || this.all[this.all.length - 1];
            return this
        },

        ring: function (opts) {
            var hgCur=opts.centralHex.hgCur,
                i, j,
                csh = this.coorShifts,
                x, y,
                filter = this.getFilter(opts.filter),
                hex;

            this.centralHex = opts.centralHex;
            this.radius = opts.radius || 1;

            for (i = 0; i < 6; i++) {
                y = this.centralHex.y + this.radius * csh[i][0];
                x = this.centralHex.x + this.radius * csh[i][1];
                (hex=hgCur.getHex(y,x)) && filter(hex) && this.push(hex);
                for (j = 0; j < this.radius - 1; j++) {
                    y += csh[(i + 2) % 6][0];
                    x += csh[(i + 2) % 6][1];
                    (hex=hgCur.getHex(y,x)) && filter(hex) && this.push(hex);
                }
            }
            return this
        },

        circle: function (opts) {
            this.all[0] = this[0] = opts.centralHex;
            this.radius = opts.radius;
            opts.type = 'ring';
            while (opts.radius) {
                this.push(this[opts.radius] = new hg.HexCollection(opts));
                opts.radius--;
            }
            return this
        },

        parallelogram: function (opts) {
            var hgCur,
                i, j = 0, that,
                vector, d1, d2,
                csh = this.coorShifts,
                x, y,
                filter = this.getFilter(opts.filter),
                hex;

            this.angle1 = opts.angle1 || opts.from;
            this.angle2 = opts.angle2 || opts.to;
            hgCur=this.angle1.hgCur;
            if (this.angle1.isStraight(this.angle2)) {
                that = new hg.HexCollection({
                    type: 'line',
                    from: this.angle1,
                    to: this.angle2
                });
                that.type = 'parallelogram';
                that.angle1 = this.angle1;
                that.angle2 = this.angle2;
                that.isDegenerate = 1;
                return that;
            }
            vector = this.angle1.getVector(this.angle2);
            d1 = vector.dirList[0];
            d2 = vector.dirList[1];
            for (i = 0; i < vector[d1] + 1; i++) {
                y = this.angle1.y + i * csh[d1][0];
                x = this.angle1.x + i * csh[d1][1];
                if (hex = hgCur.getHex(y,x)) {
                    filter(hex) && this.push(hex);
                    (i == vector[d1]) && (this.angle3 = hex);
                }
                if (d2) {
                    for (j = 0; j < vector[d2]; j++) {
                        y += csh[d2][0];
                        x += csh[d2][1];
                        if (hex = hgCur.getHex(y,x)) {
                            filter(hex) && this.push(hex);
                            (i == 0 && j == vector[d2] - 1) && (this.angle4 = hex);
                        }
                    }
                }
            }
            this.border = new hg.HexCollection({type: 'border'});
            for (i = 1; i < 3; i++) {
                for (j = 3; j < 5; j++) {
                    this.border.push(this['border' + i + j] = new hg.HexCollection({
                        type: 'line',
                        from: this['angle' + i],
                        to: this['angle' + j]
                    }));
                }
            }
            return this;
        },

        obstacle: function (opts) {
            var obst = this,
                lessHeight,
                types = {
                    line: function line(opts) {
                        var i, hex = opts.startHex,
                            length = opts.size || this.size,
                            md=opts.mainDirection||this.mainDirection;

                        for (i = 1; i < length; i++) {
                            hex = hex[md];
                            if (!checkHex(hex)) {
                                return;
                            } else {
                                this.push(hex);
                            }
                        }
                    },
                    thickLine: function (opts) {
                        var i, len, part,
                            startHex = opts.startHex,
                            hgCur=startHex.hgCur;

                        this.weight = this.size < 11 ? 2 : 3;
                        len = this.size / this.weight ^ 0;
                        part = this.size % this.weight;
                        opts.size = len + (part > 0 ? 1 : 0);
                        types.line.call(this, opts);
                        i = gbl.d(2) * 2 - 3;
                        if (part > 0) {
                            opts.size--;
                        }
                        this.push(opts.startHex = getStartHex.call(this, i));
                        if (opts.startHex) {
                            types.line.call(this, opts)
                        }
                        if (this.weight == 3) {
                            opts.size = part == 2 ? len + 1 : len;
                            if (part != 1) {
                                i *= 2
                            }
                            this.push(opts.startHex = getStartHex.call(this, -i));
                            if (opts.startHex) {
                                types.line.call(this, opts)
                            }
                            this.border = this.getBorder().setProperty('isBorderObstacle', 1);
                        }

                        function getStartHex(d) {
                            var csh = this.coorShifts,
                                y, x;
                            d = gbl.getPart(this.mainDirection + d);
                            y = startHex.y + csh[d][0];
                            x = startHex.x + csh[d][1];
                            while (!checkHex(hgCur.getHex(y,x))) {
                                y += csh[this.mainDirection][0];
                                x += csh[this.mainDirection][1];
                                if (!--opts.size) {
                                    return null
                                }
                            }
                            return hgCur.getHex(y,x);
                        }
                    },
                    bracket: function (opts) {
                        var size=opts.size,
                            md=this.mainDirection,
                            minSize=(size+3)/4^ 0,
                            moreLong=(size+3)% 4,
                            d=gbl.d(2)==1?'prev':'next',
                            i,lineOpts={},len;

                        for (i=0;i<4;i++) {
                            lineOpts.startHex=this.all.last();
                            lineOpts.size=function() {
                                if (gbl.d(4-i)>moreLong) {
                                    return minSize
                                }
                                moreLong--;
                                return minSize+1;
                            }();
                            lineOpts.mainDirection=md;
                            md=this[d+'Dir'](md);
                            len=this.length;
                            types.line.call(this,lineOpts);
                            if (this.length==len) {return}
                        }
                    },
                    massive: function (opts) {
                        var hc=this,
                            startHex=opts.startHex,
                            hgCur=startHex.hgCur,
                            size=this.size,
                            i= 0,
                            csh=this.coorShifts,
                            len,border,
                            md=this.mainDirection;

                        while (this.length<size) {
                            len=this.length;
                            addForMD(++i);
                            addRelated(++i);
                            if (len==this.length) {break}
                        }
                        border=this.getBorder();
                        if (border.length<this.length) {
                            this.border=border.setProperty('isBorderObstacle',1)
                        }

                        function addForMD(i) {
                            var y=startHex.y+i*csh[md][0],
                                x=startHex.x+i*csh[md][1],
                                hex=hgCur.getHex(y,x);

                            checkHex(hex)&&hc.push(hex);
                            f(-2);
                            f(2);

                            function f(d) {
                                if (hc.length<size) {
                                    hex=hgCur.getHex(y+csh[gbl.getPart(md+d)][0],
                                        x+csh[gbl.getPart(md+d)][1]);
                                    checkHex(hex)&&hc.push(hex);
                                }
                            }
                        }
                        function addRelated(i) {
                            var rel=hc.getRelated()
                                    .filter(function () {return checkHex(this)}),
                                hex=hgCur.getHex(startHex.y+i*csh[md][0],
                                    startHex.x+i*csh[md][1]),
                                tempHC=new hg.HexCollection(hex),
                                push;
                            if (!tempHC.length) {return}
                            if (rel.length<=size-hc.length) {return hc.push(rel)}
                            while (hc.length+tempHC.length<size) {
                                tempHC.push(push=tempHC.getRelated().cross(rel));
                                if (!push.length) {break}
                            }
                            hc.push(tempHC);
                        }
                    },
                    curve: function (opts) {
                        var md=this.mainDirection,
                            size=this.size,
                            dDir=[-2,-1,1,2],
                            d= 0,len,
                            lineOpts={};

                        while(this.length<size) {
                            lineOpts.size=gbl.d(2)+1;
                            lineOpts.startHex=this.all.last();
                            lineOpts.mainDirection=getNewDir();
                            len=this.length;
                            types.line.call(this,lineOpts);
                            if (this.length==len) {break}
                        }

                        function getNewDir() {
                            var x=Math.abs(d),
                                arr=[
                                    x<2?1:0,
                                    x?3-x:2,
                                    x?4:2,
                                    x?3:1
                                ];
                            if (d>0) {arr.reverse()}
                            d+=dDir[gbl.getRandom(arr)];
                            return gbl.getPart(md+d)
                        }
                    },
                    random: function (opts) {
                        var size=this.size,
                            t=['line','thickLine','bracket','massive','curve'],
                            probls=[
                                3-Math.abs(size-4),
                                size-4,
                                3-Math.abs(size-7),
                                (size-3)*1.5^0,
                                (6-Math.abs(size-8))*1.5^0
                            ];
                        probls.forEach(function(it,i) {
                            if (it<0) {probls[i]=0}
                        });

                        this.obstacleType=t[gbl.getRandom(probls)];
                        types[this.obstacleType].call(this,opts)
                    },
                    hexes: function (opts) {
                        var type=gbl.getType(opts.hexes);
                        switch(type) {
                            case 'Undefined':
                                return;
                            case 'HexCollection':
                                this.push(opts.hexes);
                                break
                        }
                    }
                },
                checkHex = function (hex) {
                    return hex && !hex.isObstacle && !hex.isStart && !hex.isRelatedObstacle
                };


            this.obstacleType = opts.obstacleType || 'random';
            this.size = opts.size || 1;
            this.height = opts.height || 1;
            this.mainDirection = gbl.isDefined(opts.mainDirection)
                ? opts.mainDirection
                : gbl.d(6) - 1;
            this.push(opts.startHex);
            if (typeof types[this.obstacleType] != 'function') {
                console.log('Warning! ' + this.obstacleType + ' is unknown obstacle type!');
                this.obstacleType = 'random';
            }

            if (this.size > 1) {
                types[this.obstacleType].call(this, opts)
            }

            this.size=this.length;
            this.setProperty({isObstacle: 1, obstacle: this});
            this.relatedObstacle = this.getRelated().setProperty('isRelatedObstacle', 1);
            this.corners = this.relatedObstacle.findCorners();
            lessHeight = !this.border || gbl.d(3) == 3 ? 0 : 1;
            return this.each(function () {
                this.height = !this.isBorderObstacle ? obst.height : obst.height - lessHeight;
            });
        },

        izodist: function(opts) {
            var hc=this;
            opts.prev.each(function() {
                this.neighbors.each(function() {
                    if (gbl.isDefined(this[opts.mark])||opts.forbidden.has(this)) {return}
                    this[opts.mark]=opts.markValue;
                    hc.push(this)
                })
            });
            return this;
        }
    };
    hg.HexCollection.simpleTypes=['none', 'all', 'neighbors', 'last', 'border',
        'start', 'related','group','path','hidden'];

    hg.HexCollection.prototype.extend({
        typeOfItems: 'Hex',
        coorShifts: hg.Hex.prototype.coorShifts,
        filter: function (filter) {
            var func = gbl.isFunction(filter) ? filter
                : (typeof filter == 'string')
                ? (filter.has('!')
                ? function () {
                return !this[filter.slice(1)]
            }
                : function () {
                return this[filter]
            })
                : function () {
                return true
            };

            return gbl.Collection.prototype.filter.call(this, func);
        },
        getFilter:function(filter) {
            return gbl.isFunction(filter)
                ? filter
                : typeof filter == 'string'
                ? (filter.has('!')
                ? function (hex) {
                return !hex[filter.slice(1)]
            }
                : function (hex) {
                return hex[filter]
            })
                : function () {
                return true
            };
        },
        getBorder: function () {
            var that = this,
                border = new hg.HexCollection({type: 'border'});
            this.each(function () {
                var hex = this;
                this.neighbors.each(function () {
                    if (!that.has(this)) {
                        border.push(hex);
                        return false;
                    }
                })
            });
            return border;
        },
        getRelated: function () {
            var that = this,
                related = new hg.HexCollection({type: 'related'});
            this.each(function () {
                this.neighbors.each(function () {
                    if (!that.has(this)) {
                        related.push(this)
                    }
                })
            });
            return related;
        },
        setProperty: function (prop, value) {
            var props;
            if (typeof prop == 'object') {
                props = prop
            }
            else {
                props = {};
                props[prop] = value;
            }
            return this.each(function () {
                var hex = this;
                props.forOwn(function (prop) {
                    hex[prop] = this[prop];
                })
            })
        },
        deleteProperty: function () {
            var props = gbl.toArray(arguments);
            return this.each(function () {
                var i = props.length;
                while (i--) {
                    delete this[props[i]]
                }
            })
        },
        findCorners: function () {
            var hgCur=this.all[0].hgCur,
                c = {};
            this.each(function () {
                c.minX = c.minX == undefined || c.minX > this.x ? this.x : c.minX;
                c.maxX = c.maxX == undefined || c.maxX < this.x ? this.x : c.maxX;
                c.minY = c.minY == undefined || c.minY > this.y ? this.y : c.minY;
                c.maxY = c.maxY == undefined || c.maxY < this.y ? this.y : c.maxY;
                c.minXY = c.minXY == undefined || c.minXY > (this.x + this.y) ? this.x + this.y : c.minXY;
                c.maxXY = c.maxXY == undefined || c.maxXY < (this.x + this.y) ? this.x + this.y : c.maxXY;
            });
            return {
                0: hgCur.getHex(c.maxXY - c.maxX,c.maxX),
                1: hgCur.getHex(c.maxY,c.maxXY - c.maxY),
                2: hgCur.getHex(c.maxY,c.minX),
                3: hgCur.getHex(c.minXY - c.minX,c.minX),
                4: hgCur.getHex(c.minY,c.minXY - c.minY),
                5: hgCur.getHex(c.minY,c.maxX)
            }
        },
        getGroups:function() {
            var hc=this,
                groups=[],
                group,
                garbage;
            while (hc.length) {
                select(hc.all[0]);
                groups.push(group=new hg.HexCollection('group'));
                garbage=new hg.HexCollection();
                hc.each(function() {
                    if (this._gr) {group.push(this)}
                    else {garbage.push(this)}
                });
                group.deleteProperty('_gr');
                hc=garbage;
            }
            return groups;

            function select(hex) {
                hex._gr=1;
                hex.neighbors.each(function() {
                    if (!this._gr&&hc.has(this)) {select(this)}
                })
            }
        },
        collectForbidden:function(hgCur,unwanted) {
            var i,len;
            if (gbl.getType(unwanted).has('Hex')
                || gbl.isArray(unwanted)
                && unwanted.every(function (it) {
                    return gbl.getType(it).has('Hex')
                })
            ) {
                this.push(unwanted)
            } else if (typeof unwanted == 'string') {
                this.push(hgCur.allHexes.filter(unwanted))
            } else if (gbl.isArray(unwanted)
                && unwanted.every(function (it) {
                    return typeof it == 'string'
                })
            ) {
                for (i = 0, len = unwanted.length; i < len; i++) {
                    this.push(hgCur.allHexes.filter(unwanted[i]))
                }
            }
        },
        prevDir:hg.Hex.prototype.prevDir,
        nextDir:hg.Hex.prototype.nextDir,
        getRight:hg.Hex.prototype.getRight,
        getRandomHex:function() {
            return this.all[gbl.d(this.length)-1]
        },
        sortByDistance:function(hex) {
            return this.sort(function(a,b) {
                return hex.getDistance(a)-hex.getDistance(b)
            })
        },
        filterByVisibility:function(hex,hidSectors) {
            if (gbl.getType(hidSectors)=='HexCollection') {
                hidSectors=new hg.HiddenSectors(hex,hidSectors);
            }
            return this.filter(function() {
                return !hidSectors.has(this)
            })
        }
    }, true);

    hg.Path = function Path(from, to) {
        var mark=from.markLeeData.markName,
            hex=to,
            i=to[mark],
            nh;

        this.from=from;
        this.to=to;
        this.hexes=new hg.HexCollection('path').push(to);
        this.steps=[];

        while (i--) {
            nh=this.getNextHex(mark,hex);
            this.steps.unshift({
                from:nh.hex,
                to:hex,
                direction:nh.direction
            });
            this.hexes.push(hex=nh.hex);
        }
    };
    
    hg.Path.prototype = {
        getNextHex:function(mark,hex) {
            var m=hex[mark]-1,i;
            for (i=0;i<6;i++) {
                if (hex[i]&&hex[i][mark]==m) {
                    return {
                        hex:hex[i],
                        direction:gbl.getPart(i+3)
                    }
                }
            }
        }
    };

    hg.HiddenSector=function HiddenSector(r,l,d) {
        this.right=r;
        this.left=l;
        this.distance=d;
    };

    hg.HiddenSector.prototype={
        constructor:hg.HiddenSector,
        isInside:function(n) {
            return this.full?true
                :gbl.getPart(this.left-this.right,360)>=gbl.getPart(n- this.right,360)
        },
        setSide:function(side,n) {this[side]=n},
        round:function(n) {return gbl.getPart(gbl.round(n,2),360)},
        getParts:function(parts,hexPars) {
            var part;
            if (hexPars.d<=this.distance) {return}
            if (this.isInside(hexPars.l)) {
                part = this.round((hexPars.l - this.right) / hexPars.aw);
                if (!parts.l || parts.l < part) {
                    parts.l = part
                }
            }

            if (this.isInside(hexPars.r)) {
                part = this.round((this.left - hexPars.r) / hexPars.aw);
                if (!parts.r || parts.r < part) {
                    parts.r = part
                }
            }
        }
    };

    hg.HiddenSectors=function HiddenSectors(hex,hc) {
        var ha=this;
        this.all=[];
        this.hex=hex;
        this.hc=new hg.HexCollection();
        hc.sortByDistance(hex).each(function() {
            ha.pushIn(this)
        });
    }.inherit(gbl.Collection);

    hg.HiddenSectors.prototype.extend({
        typeOfItems:'HiddenSector',
        minDistance:Infinity,
        rnd2:function(n) {return gbl.round(n,2)},
        getPart:function(n) {return gbl.getPart(n,360)},
        pushIn:function(hex) {
            var ha=this,
                polar=this.hex.getPolar(hex),
                left=this.rnd2(polar.fiDeg+30/polar.r),
                right=this.rnd2(polar.fiDeg-30/polar.r),
                upd,
                side={'1':'left','2':'right'};

            if (this.hc.has(hex)||!polar.r) {return this}
            this.hc.push(hex);
            right=this.getPart(right);

            this.each(function() {
                var x=0;
                if (this.isInside(left)) {
                    x+=1;
                }
                if (this.isInside(right)) {
                    x+=2;
                }

                if (x==3) {
                    if (this.distance==polar.r) {
                        this.full=1;
                    }
                    upd=1;
                    return false;
                }

                if (x==0) {return}
                if (this.distance==polar.r) {
                    if (upd) {
                        upd[side[x]]=this[side[x]];
                        ha.remove(this);
                        return
                    }
                    upd=this;
                    this.setSide(side[3-x],x==1?right:left);
                }
            });

            if (!upd) {
                if (this.minDistance>polar.r) {this.minDistance=polar.r}
                this.push(new hg.HiddenSector(right,left,polar.r))
            }
        },
        clone:function() {
            var newHS=new hg.HiddenSectors(this.hex,this.hc.clone());
            newHS.all=this.all.slice();
            return newHS
        },
        add:function(hc) {
            return new this.constructor(this.hex,this.hc.add(hc))
        },
        has:function(hex) {
            var parts={l:0,r:0},
                polar=this.hex.getPolar(hex),
                hexPars={},
                result=false;

            if (!polar.r) {return}
            hexPars.d=polar.r;
            hexPars.aw=this.rnd2(60/polar.r);
            hexPars.l=this.rnd2(polar.fiDeg+hexPars.aw/2);
            hexPars.r=this.getPart(this.rnd2(polar.fiDeg-hexPars.aw/2));

            this.each(function() {
                this.getParts(parts,hexPars);
                if (parts.l+parts.r>.5) {
                    result=true;
                    return false
                }
            });
            return result
        },
        each:function(fn) {
            var arr = this[this.genArrName],
                i, len= arr.length;
            for (i = 0; i < arr.length; i++) {
                if (fn.call(arr[i], i, this) === false) break;
                if (len!=arr.length) {
                    i--;
                    len=arr.length;
                }
            }
            return this
        }
    },true);

    return hg;
});