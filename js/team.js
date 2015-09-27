/**
 * @author Gordon from Blumberg
 * @description Team module
 * @version 0.1.0
 */

define(['GBL'],function (gbl) {
    "use strict";

    var team = {};
    team.name = 'team.js';
    team.version = '0.1.0';

    team.Team = function Team(opts) {

    }.inherit(gbl.Collection);

    team.Team.prototype.extend({},true);

});