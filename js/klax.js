/**
 * Created by Gordon from Blumberg on 27.09.2015.
 * @author Gordon from Blumberg
 * @description Main module of game
 * @version 0.1.0
 */

define(['GBL'
    , 'battlefield'
    , 'battle'
    , 'unit'
    ],

    function(gbl
        , bf
        , battle
        , unit){
    "use strict";

        console.log('Downloaded:');
        console.log(gbl.name, gbl.version);
        console.log(bf.name, bf.version);
        console.log(battle.name, battle.version);
        console.log(unit.name, unit.version);
});
