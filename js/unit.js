/**
 * @author Gordon from Blumberg
 * @description Module for units, creates and characters
 * @version 1.0.0
 */

define(['GBL', 'protounit', 'config'], function(gbl, pu, cg) {
    "use strict";

	var unit={};

    unit.name='unit.js';
    unit.version='1.0.0';

    /* Properties for opts:
     * race: str;
     * avaSrc: str;
     */

    unit.Unit=function(opts) {
        var parsOpts={};

        this._super(opts);

        this.race=(opts.race in cg.races)?opts.race:'human';

        this.avaSrc=opts.avaSrc;
    }.inherit(pu.Protounit);

    unit.Unit.prototype.extend({
        prefixes:[
            {pref: 'race', dep: 'base'},
            {pref: 'modCreate', dep: 'base'},
            {pref: 'modOther', dep: 'base'},
            {pref: 'modTrain', dep: 'base'},
            {pref: 'modSkill', dep: 'base'},
            {pref: 'modEquip', dep: 'base'},
            {pref: 'modSpell', dep: 'base'},
            {pref: 'base', dep: 'sum(race$,modCreate$)'},
            {pref: 'own', dep: 'sum(base$,modTrain$,modSkill$)'},
            {pref: 'temp', dep: 'sum(modOther$,modEquip$,modSpell$)'},
            {pref: 'act', dep: 'sum(own$,temp$)'}
        ],
        setAva:function(src) {
            this.elem.css({backgroundImage:'url(img/creatures/'+src+')'})
        },
        createElement:function(opts) {  //opts is object for method createElement
            this.elem=createElement('div',opts)
        },
        setPosition:function(hex) {
            var th=this,
                bf=currentBattlefield,
                hexCoor=hex.getCoords().center,
                az,el=th.elem[0];
            th.currentPosition=hex;
            if (th.direction===undefined) th.direction=3;
            az=(720+bf.getAngleAzimut()-th.direction*60)%360;
            el.reflect=(az>90&&az<270)?1:0;
            el.x=hexCoor.x;
            el.y=hexCoor.y;
            if (!th.elem.isChildren(bf.scene3d)) th.elem.insertTo(bf.scene3d)
        }
    },true);

    return unit;
});