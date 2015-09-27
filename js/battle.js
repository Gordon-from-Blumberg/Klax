/**
 * @author Gordon from Blumberg
 * @description Battle module
 * @version 1.0.0
 */

define(['GBL', 'battlefield'], function(gbl,bf) {
    "use strict";

	var battle={},
        bfConstr=bf.Battlefield,
        countOfBattles=0,
		countOfPlayersBattles=0;

    battle.name='battle.js';
    battle.version='1.0.0';

    /* Needed properties in opts:
     * teams: Team[], necessary!;
     * battlefield: object with battlefield configuration
     *  (template, teamsCount, startAreaSize, obstacles);
     *
     */
    battle.Battle= function Battle(opts) {
		var battle=this,
            bf;

		this.teams=opts.teams;
        opts.battlefield=opts.battlefield||{};
		this.teamsCount=opts.battlefield.teamsCount=opts.teams.length;
        this.battlefield=bf=new bfConstr(opts.battlefield,this);
		this.collectAllUnits();
		
		/*this.allUnits[0].setPosition(bf[0][6]);
		this.allUnits[1].setPosition(bf[-1][2]);
		this.allUnits[2].setPosition(bf[5][6]);
		this.allUnits[3].setPosition(bf[5][1]);*/

        countOfBattles++;
		if (opts.player) countOfPlayersBattles++;
	};

    battle.Battle.prototype={
        constructor:battle.Battle,
        collectAllUnits:function() {
            this.allUnits=[];
            for (var i=0;i<this.teamsCount;i++) {
                for (var j=0;j<this.teams[i].battlingUnits.length;j++) {
                    this.allUnits.push(this.teams[i].battlingUnits[j])
                }
            }
        }
        // callMethodsForUnits:Collection.prototype._callMethods('allUnits'),
        // callMethodsForTeams:Collection.prototype._callMethods('teams'),
    };

    /* Needed properties in opts:
     *
     */
    battle.BattleEventExciter=function BattleEventExciter(opts) {
        this.listeners={}
    };

    battle.BattleEventExciter.prototype={
        constructor:battle.BattleEventExciter,
        on:function(type, fn) {
            if (!this.listeners[type]) {this.listeners[type]=[]}
            if (gbl.isFunction(fn)) {this.listeners[type].push(fn)}
            else {console.log('Warning! fn must be a function!')}
            return this
        },
        off:function(type,fn) {
            if (gbl.isArray(this.listeners[type])) {
                this.listeners[type].remove(fn)
            }
            return this
        },
        trigger:function(type,opts) {
            var event=this.getEvent(type,opts);
            if (gbl.isArray(this.listeners[type])) {
                this.listeners[type].forEach(function(fn) {
                    fn.call(event.context,event)
                })
            }
            return this
        },
        getEvent:function(type,opts) {}
    };

    return battle;
});