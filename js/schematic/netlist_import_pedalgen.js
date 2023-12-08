// Import pedalgen parameters from url
// linter: ngspicejs-lint
/* global window, URLSearchParams, document, console, CA */
"use strict";

var SC = window.SC || {};

SC.netlistImportPedalgenFromUrl = function () {
    // Import netlist directly from the url:
    // schematic.html?pedalgen=battery,U1,9,1,0|resistor,R1,100,1,2|resistor,R2,1M,2,0
    var s = (new URLSearchParams(document.location.search)).get('pedalgen');
    if (!s) {
        return;
    }
    var a = s.split('|').map((a) => a.split(','));
    var ret = [];
    a.forEach((c) => {
        var o = {
            type: c[0],
            name: c[1],
            value: c[2],
            nets: c.slice(3)
        };
        if (o.type === 'npn' || o.type === 'pnp') {
            o.type = 'transistor_' + o.type;
        }
        o.nets = o.nets.map(function (n) {
            return n === '0' ? 'gnd' : n;
        });
        ret.push(o);
    });
    var d = CA.modalDialog('Import pedalgen netlist?', s.split('|').join('\n'), ['Import', 'Cancel'], function (aButton) {
        if (aButton === 'Import') {
            SC.netlistImport(ret); // , SC.components.toObject()
            SC.filename = 'pedalgen';
            SC.v.zoom = 20;
            var c = SC.components.center();
            SC.v.centerTo(c.x, c.y);
            SC.render();
            SC.onTool({target:{id: 'tool_select'}});
        }
    });
    d.content.style.whiteSpace = 'pre-wrap';
    console.log(ret);
};


