// Autoplacement of components after import
"use strict";
// globals: document, window, CA

var SC = window.SC || {};

SC.autoplaceByType = function () {
    // Place components in rows by their type, into columns by their number
    var i, o = {}, t, x = 0, y = 0, h, c, img;
    // sort by types
    for (i = 0; i < SC.components.item.length; i++) {
        o[SC.components.item[i].type] = o[SC.components.item[i].type] || [];
        o[SC.components.item[i].type].push(SC.components.item[i]);
    }

    function compareNameNumber(a, b) {
        // sort by number in name
        return parseFloat(a.name.match(/[0-9]+/)) - parseFloat(b.name.match(/[0-9]+/));
    }

    // place components
    for (t in o) {
        if (o.hasOwnProperty(t)) {
            o[t].sort(compareNameNumber);
            x = 0;
            h = 0;
            for (i = 0; i < o[t].length; i++) {
                c = o[t][i];
                c.x = x / SC.gridSize;
                c.y = y / SC.gridSize;
                c.rotate = 0;
                c.mirror = false;
                c.updatePins();
                img = c.image();
                h = Math.max(h, img.height);
                x += SC.gridSize * Math.ceil(img.width / SC.gridSize) + SC.gridSize;
            }
            y += SC.gridSize * Math.ceil(h / SC.gridSize) + SC.gridSize;
        }
    }
};

