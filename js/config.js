/**
 * @author Gordon from Blumberg
 * @description Configuration of game
 * @version 1.0.0
 */

define(['GBL'], function(gbl) {
    "use strict";

    var cg={
        name:'config.js',
        version:'1.0.0'
    };

    cg.battlefield={
        teamsCount:2,
        startAreaSize:9,
        obstacle:{
            pars:{
                density:2,
                maxSize:12,
                middleSize:4,
                height:1,
                distribution:'uniform'
            },
            probls:{
                height:[
                    [7,1,0],
                    [6,3,1],
                    [2,5,1],
                    [1,3,5],
                    [0,2,7]
                ],
                size:function(maxS,midS) {
                    var arr=[],prev=1,
                        i, pos, step=2,
                        start;
                    start=((maxS-1)/2>midS-1)?maxS-1:0;
                    for (i=0;i<maxS;i++) {
                        pos=start?maxS-1-i:i;
                        arr[pos]=prev;
                        if (pos==midS-1) {step=-2}
                        prev+=step;
                    }
                    return arr;
                },
                hex:function(distr) {
                    return {
                        center:function(hex) {
                            var d=hex.bfCur.centralHex.getDistance(hex),
                                p=25-d*3;
                            return p<1?1:p
                        },
                        peripheral:function(hex) {
                            return 3+2*hex.bfCur.centralHex.getDistance(hex)
                        },
                        uniform:function() {return 1}
                    }[distr]
                }
            }
        }
    };

    cg.unit={
        races:{
            human:{
                size:3,
                baseDexterity:6,
                baseStrength:6,
                baseCharism:6,
                baseIntelligence:8,
                modMaxHP:0
            },
            elf:{
                size:3,
                baseDexterity:7,
                baseStrength:5,
                baseCharism:6,
                baseIntelligence:8,
                modMaxHP:0
            },
            goblin:{
                size:2,
                baseDexterity:7,
                baseStrength:6,
                baseCharism:5,
                baseIntelligence:7,
                modMaxHP:0
            }
        }
    };
});