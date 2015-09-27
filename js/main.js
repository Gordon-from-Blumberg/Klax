/**
 * Created by Gordon from Blumberg on 27.09.2015.
 * @author Gordon from Blumberg
 * @description Entry point to app
 */

requirejs.config({
    baseUrl:'js',
    paths: {
        GBL:'lib/GBL'
    }
});

require(['klax'],
    function (klax) {

    });
