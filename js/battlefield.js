/**
 * @author Gordon from Blumberg
 * @description Battlefield module
 * @version 1.0.0
 */

define(['GBL', 'hexgrid', 'config'], function (gbl, hg, cg) {
    "use strict";

    var bf = {
        name: 'battlefield.js',
        version: '1.0.0'
    };

    hg.HexCollection.types.startArea = function (opts) {
        var size = opts.size || 9,
            r = 1, obj;
        this.push(this.startHex = opts.startHex);
        obj = {
            type: 'ring',
            centralHex: this.startHex
        };
        while (this.length < size) {
            obj.radius = r++;
            this.push(new hg.HexCollection(obj));
        }
        return this.setProperty('isStart', 1)
    };

    /* Battlefield expects next properties in opts:
     * template: string | object {
     *  gridShape: string ['rad'], default: 'rad',
     *  gridSize: int [>=4], default: 6,
     * };
     * teamsCount: int [2-6], default: 2;
     * startAreaSize: int [>=1], means minimum, default: 9;
     * obstacles: string | object {
     *  density: int [1-4], def: 2,
     *  maxSize: int [>=1], def: 12,
     *  middleSize: int [1-maxSize], def: 4,
     *  height: int [0-4], def: 1,
     *  distribution: str ['uniform' | 'center' | 'peripheral'], def: 'uniform'
     * }
     */
    bf.Battlefield = function Battlefield(opts, battle) {  //template
        var bfCur = this,
            _start=new Date,
            st1,st2;

        this._super(opts);
        console.log('Parent constructor worked '+(new Date-_start)+'ms.');
        this.battle=battle;

        this.setStartAreas(opts.teamsCount || cg.teamsCount,
            opts.startAreaSize||cg.startAreaSize);

        st1=new Date;
        this.generateObstacles(opts.obstacles);
        console.log('Obstacles generated for '+(new Date-st1)+'ms.');

        st2=new Date;
        this.findVisibleHexes();
        console.log('Visible hexes found for '+(new Date-st2)+'ms.');

        console.log('Battlefield created for '+(new Date-_start)+'ms.');
    }.inherit(hg.Hexgrid);

    bf.Battlefield.prototype.extend({
        setStartAreas: function (number, size) {
            var opts = {type: 'startArea', size: size, startHex: this.startHexes.all[3]},
                i = number;
            this.startAreas = [new hg.HexCollection(opts)];
            while (--i) {
                opts.startHex = this.startHexes.all[gbl.getPart(3 + 6 * i / number)];
                this.startAreas.push(new hg.HexCollection(opts));
            }
            return this
        },

        generateObstacles:function(opts) {
            var bfCur=this,
                templates={
                    none:function() {
                        bfCur.templateData.obstacles.template='none'
                    },
                    arena:function() {}
                },
                splitArr,
                pars=cg.obstacle.pars,
                probls=cg.obstacle.probls,
                properties=['density', 'maxSize', 'middleSize', 'height', 'distribution'],
                hexProbls=new Array(this.allHexes.length),
                sizeProbls,
                heightProbls,
                maxNumber,
                hcOpts={type:'obstacle', obstacleType:'random'},
                all=this.allHexes.all;

            this.obstacles=this.thisPublic.obstacles=[];
            this.templateData.obstacles={};
            opts=opts||{};

            if (typeof opts=='string') {
                if (gbl.isFunction(templates[opts])) {
                    return templates[opts]()
                }
                if ((splitArr=opts.split('-')).length!=4) {
                    console.log('Warning! '+opts+' is unknown obstacles template!');
                    opts={};
                } else {
                    opts={};
                    splitArr.forEach(function(it,i) {
                        opts[properties[i]]=it
                    })
                }
            }

            if (opts.maxSize&&!opts.middleSize) {
                opts.middleSize=opts.maxSize/2^0
            }
            if (!opts.maxSize&&opts.middleSize) {
                opts.maxSize=opts.middleSize*1.6^0
            }
            properties.forEach(function(it) {
                if (!gbl.isDefined(opts[it])) {opts[it]=pars[it]}
                bfCur.templateData.obstacles[it]=opts[it]
            });

            maxNumber=gbl.round(this.allHexes.length*opts.density/20);
            sizeProbls=probls.size(opts.maxSize,opts.middleSize);
            heightProbls=probls.height[opts.height];

            while (number()<maxNumber) {
                setHexProbls();
                hcOpts.startHex=all[gbl.getRandom(hexProbls)];
                hcOpts.size=gbl.getRandom(sizeProbls)+1;

                hcOpts.height=gbl.getRandom(heightProbls)+1;
                this.obstacles.push(new hg.HexCollection(hcOpts));
            }

            return this;

            function number() {
                var sum=0;
                bfCur.obstacles.forEach(function(it) {
                    sum+=it.length
                });
                return sum
            }
            function setHexProbls() {
                bfCur.each(function(i) {
                    hexProbls[i]=this.isObstacle||this.isStart||this.isRelatedObstacle
                        ?0:probls.hex(opts.distribution)(this)
                });
            }
        },

        findVisibleHexes:function() {
            var obstacles=new hg.HexCollection(this.obstacles).filter(function() {
                return this.height>=2
            }),
                all=this.allHexes.filter('!isObstacle');
            all.each(function() {
                var that=this;
                setTimeout(function() {
                    that.visibleHexes=all.filterByVisibility(that,obstacles);
                },0)
            });
            return this
        }
    },true);

    return bf;
});