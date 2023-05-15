// Copy placement (component placement, guides) from other schematic file
"use strict";
// globals: document, window

var SC = window.SC || {};

SC.copyPlacement = function (aOther) {
    var i, j, cur, oth;
    for (i = 0; i < SC.components.item.length; i++) {
        cur = SC.components.item[i];
        for (j = 0; j < aOther.components.item.length; j++) {
            oth = aOther.components.item[j];
            if (cur.name === oth.name) {
                cur.x = oth.x;
                cur.y = oth.y;
                cur.mirror = oth.mirror;
                cur.rotate = oth.rotate;
                cur.updatePins();
            }
        }
    }
    SC.guides.fromObject(aOther.guides);
    SC.render();
};
