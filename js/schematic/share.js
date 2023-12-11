// Create shareable url with schematic data in url
// linter: ngspicejs-lint
/* global document, window, CA, URL, URLSearchParams, alert */
"use strict";

var SC = window.SC || {};

SC.shareableExport = function () {
    // Return shareable url for current schematic
    // chrome-extension://pjebgnafikcpkeheibmimmdlmfmfoabj/schematic.html?share=battery,U1,9,10,gnd,14,15,0,false|resistor,R1,220k,2,4,-4,14,3,false|resistor,R2,1k,4,10,-1,10,2,false|resistor,R3,470k,5,6,6,14,3,false|resistor,R4,22k,7,6,2,17,3,false|resistor,R5,100,7,gnd,-1,19,0,false|resistor,R6,2.2k,6,gnd,4,19,0,false|resistor,R7,2.2k,11,gnd,12,19,0,false|capacitor,C1,4.7u,1,2,-7,16,3,false|capacitor,C2,1u,4,5,2,14,3,false|capacitor,C3,4.7u,6,11,9,17,3,false|transistor_npn,T1,BC547,4,2,7,-2,16,0,false|transistor_pnp,T2,BC557,6,5,10,7,11,2,true|sinewave,U2,10mV 196Hz,1,gnd,-8,19,0,false|ground,Ground,,gnd,14,22,0,false
    var prefix = new URL(document.location);
    prefix.search = '';
    prefix = prefix.toString();
    // components
    var params = SC.components.item.map((c) => {
        return [c.type, c.name, c.value, c.pinNet.join(','), c.x, c.y, c.rotate, c.mirror ? 1 : 0].join(',');
    }).concat(
        // guides
        SC.guides.item.map((g) => ['g',g.net,g.x,g.y].join(','))
    ).join('|');

    //SC.guides.item.map(g => ['g', g.net, g.x, g.y].join(','))

    //console.log(prefix + '?share=' + params);
    return prefix + '?share=' + params;
};

SC.shareableImport = function () {
    // Import schematic from url ?share=resistor,R1,10k,vcc,out,10,10,3,0|resistor,R2,20k,out,0,20,10,3,0|
    var params = new URLSearchParams(document.location.search);
    var s = params.get('share');
    if (!s) {
        return;
    }
    //var net_count = SC.specsPin.transistor_npn.length
    s = s.split('|').map((a) => a.split(','));
    //console.log(s);
    var ret = [];
    var has_position = false;
    s.forEach((a) => {
        // guides
        if (a[0] === 'g') {
            return;
        }
        // components
        if (!SC.specsPin[a[0]]) {
            alert('Shared url has unknown component: ' + a[0]);
            throw "Shared import failed";
        }
        var n = SC.specsPin[a[0]].length;
        //console.warn(a, n, 3 + n);
        if (a.length <= 3 + n) {
            a.push(0);
            a.push(0);
            a.push(0);
            a.push(0);
        } else {
            has_position = true;
        }
        ret.push({
            type: a[0],
            name: a[1],
            value: a[2],
            nets: a.slice(3, 3 + n),
            x: parseInt(a[3 + n], 10),
            y: parseInt(a[3 + n + 1], 10),
            rotate: parseInt(a[3 + n + 2], 10),
            mirror: a[3 + n + 3] === '1' ? true : false
        });
    });
    //console.log(ret);
    SC.netlistImport(ret);
    s.forEach((a) => {
        if (a[0] === 'g') {
            SC.guides.item.push(new SC.Guide(a[1], parseInt(a[2], 10), parseInt(a[3], 10)));
        }
    });
    //console.log(SC.guides.item);
    SC.filename = 'shared_shematic';
    SC.v.zoom = 20;
    var c = SC.components.center();
    SC.v.centerTo(c.x, c.y);
    SC.render();

    // if url does not contain positions, spread components
    if (!has_position) {
        SC.onSpread();
        var old = {item: [
            {name: 'IN', x: -13, y: 10, rotate: 2, mirror: false},
            {name: 'CIN', x: -10, y: 10, rotate: 3, mirror: false},
            {name: 'V2', x: 23, y: 8, rotate: 0, mirror: false},
            {name: 'Ground', x: 23, y: 19, rotate: 0, mirror: false},
            {name: 'COUT', x: 17, y: 12, rotate: 3, mirror: false},
            {name: 'OUT', x: 21, y: 12, rotate: 0, mirror: false}
        ]};
        var is_interface = {};
        old.item.forEach((o) => {
            var e = SC.components.findByName(o.name);
            if (e) {
                e.restoreFromComponents(old);
                is_interface[o.name] = true;
            }
        });
        SC.autoplace2(is_interface, {minx: -7, miny: -2, maxx: 16, maxy: 22});
        var cen = SC.components.center();
        SC.v.centerTo(cen.x, cen.y);
        SC.render();
    }
    // redirect to same page without url params so that user can reload page
    if (params.get('reload') !== 'false') {
        document.location = 'schematic.html';
    }
};

SC.onShare = function () {
    // Show dialog with shareable url
    var a = document.createElement('a');
    a.href = SC.shareableExport();
    a.textContent = a.href;
    var d = CA.modalDialog('Share schematic URL', '', ['Copy to clipboard'], function (aButton) {
        if (aButton === 'Copy to clipboard') {
            CA.copyToClipboard(a.href);
        }
    });
    d.content.style.margin = '1ex';
    d.content.style.maxWidth = '75vw';
    d.content.style.overflowWrap = 'anywhere';
    d.content.appendChild(a);
};


