// Attempt at better autoplacement of components after import
"use strict";
// globals: document, window, CA
/* global window, CA, console */
// linter: ngspicejs-lint

var SC = window.SC || {};

SC.autoplace2 = function (aFixedNames, aConstraints) {
    console.log('autoplace2', aFixedNames, aConstraints);

    var best_score = 999999999, best, bestn;

    SC.autoplace2_randomize = function () {
        // Randomize components, render and return number of intersections
        SC.components.item.forEach((c) => {
            if (!aFixedNames[c.name]) {
                c.rotate = Math.floor(4 * Math.random());
                c.mirror = Math.random() > 0.5;
                c.x = CA.randomInt(aConstraints.minx, aConstraints.maxx);
                c.y = CA.randomInt(aConstraints.miny, aConstraints.maxy);
            }
            c.updatePins();
        });
        //SC.components.render(SC.layer.component.context);
        SC.nets.render();

        //SC.render();
        return SC.nets.intersects;
    };

    var t1 = Date.now();
    for (var i = 0; i < 2000; i++) {
        var intersections = SC.autoplace2_randomize();
        var total_length =SC.nets.total_length;
        var score = intersections * 10 + total_length;
        if (score < best_score) {
            best_score = score;
            best = SC.components.toObject();
            bestn = SC.nets.toObject();
            //console.log('best_score', Math.round(best_score), 'i', intersections, 'tl', total_length);
        }
    }

    SC.components.fromObject(best);
    SC.nets.fromObject(bestn);
    SC.render();
    var t2 = Date.now();
    console.log(t2 - t1, 'ms');
};
