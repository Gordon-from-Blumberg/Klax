/**
 * @author Gordon from Blumberg
 * @description Base class for units
 * @version 1.0.0
 */

define(['GBL'], function (gbl) {
    "use strict";

    var pu = {},
        cg = {};  //this variable must be removed

    pu.name = 'protounit.js';
    pu.version = '1.0.0';

    pu.Protounit = function (opts) {
        var prUnit = this,
            parsOpts = [];

        this._parameters = new gbl.Variables();

        prUnit.parameters.forEach(function (par) {
            /*prUnit._sortPrefixes(*/prUnit.prefixes/*)*/
                .forEach(function (pref) {
                    parsOpts.push({
                        name: pref.pref + par,
                        dependence: pref.dep == 'base' ? null : pref.dep.replace(/\$/g, par)
                    })
            })
        });

        this._parameters.add(parsOpts);

        this.eventListeners={}
    };

    pu.Protounit.prototype = {
        constructor: pu.Protounit,
        prefixes: [
            {pref: 'race', dep: 'base'},
            {pref: 'modCreate', dep: 'base'},
            {pref: 'modOther', dep: 'base'},
            {pref: 'base', dep: 'sum(race$,modCreate$)'},
            {pref: 'own', dep: 'sum(base$)'},
            {pref: 'temp', dep: 'sum(modOther$)'},
            {pref: 'act', dep: 'sum(own$,temp$)'}
        ],
        parameters: ['Strength', 'Dexterity', 'Charism', 'Intelligence'],
        addParameters:function(parsOpts) {
            this._parameters.add(parsOpts);
            return this
        },
        /*_sortPrefixes: function () {
            return this.prefixes.sort(
                function (a, b) {
                    if (a.dep == 'base' || b.dep == 'base') {
                        return a.dep != 'base' ? 1 : b.dep != 'base' ? -1 : 0
                    }
                    if (a.dep.has(b.pref)) {
                        return 1
                    }
                    if (b.dep.has(a.pref)) {
                        return -1
                    }
                    return 0
                })
        }*/
        addEventListener:function(type, fn) {
            if (!this.eventListeners[type]) {this.eventListeners[type]=[]}
            if (gbl.isFunction(fn)) {this.eventListeners[type].push(fn)}
            else {console.log('Warning! fn must be a function!')}
            return this
        },
        removeEventListener:function(type, fn) {
            if (gbl.isArray(this.eventListeners[type])) {
                this.eventListeners[type].remove(fn)
            }
            return this
        }
    };

    return pu;
});