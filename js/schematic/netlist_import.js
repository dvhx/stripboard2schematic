// Import netlist made by stripboard.html
"use strict";
// globals: document, window

var SC = window.SC || {};

SC.netlistImport = function (aData, aOldComponents, aOldGuides) {
    // Import netlist made by stripboard.html
    var i, c, p, ok;
    SC.components.item = [];
    SC.nets.item = [];
    SC.guides.item = [];
    // components
    for (i = 0; i < aData.length; i++) {
        ok = false;
        // import special by schematic (e.g. 2 triangles instead of dip8 dual opamp)
        if (SC.netlistImportSchematic[aData[i].schematic]) {
            ok = SC.netlistImportSchematic[aData[i].schematic](aData[i], aOldComponents);
        }
        // normal import
        if (!ok) {
            c = new SC.Component(aData[i].type, aData[i].name, aData[i].value, 0, 0, 0, false);
            SC.components.item.push(c);
            for (p = 0; p < aData[i].nets.length; p++) {
                SC.nets.addComponentPin(aData[i].nets[p], c, p);
            }
        }
    }
    // autoplace
    SC.autoplaceByType();
    // reuse old position/rotation/mirror if available
    if (aOldComponents) {
        for (i = 0; i < SC.components.item.length; i++) {
            SC.components.item[i].restoreFromComponents(aOldComponents);
        }
    }
    // restore guides if available
    if (aOldGuides) {
        SC.render();
        for (i = 0; i < aOldGuides.item.length; i++) {
            SC.guides.item.push(new SC.Guide(aOldGuides.item[i].net, aOldGuides.item[i].x, aOldGuides.item[i].y));
        }
        return true;
    }
};

