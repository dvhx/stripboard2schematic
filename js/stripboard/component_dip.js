// DIP package (opamp, etc...)
"use strict";
// globals: document, window, CA, vec2

var SC = window.SC || {};

SC.Dip = function (aName, aX1, aY1, aX2, aY2) {
    this.type = 'dip';
    this.name = aName;
    this.x1 = aX1 || 0;
    this.y1 = aY1 || 0;
    this.x2 = aX2 || 0;
    this.y2 = aY2 || 0;
    this.value = ''; // TL071
    this.pinout = ''; // SC.specsDip['4x4'].TL071.pinout;
    this.schematic = 'dip'; // SC.specsDip['4x4'].TL071.schematic
    this.flipped = false;
};

SC.factory.dip = SC.Dip;
SC.namingPrefix.dip = 'IC';

SC.Dip.prototype.toObject = function () {
    // Return exportable object
    return {
        type: this.type,
        name: this.name,
        x1: this.x1,
        y1: this.y1,
        x2: this.x2,
        y2: this.y2,
        value: this.value,
        pinout: this.pinout,
        flipped: this.flipped,
        schematic: this.schematic
    };
};

SC.Dip.prototype.fromObject = function (aObject) {
    // Set this from previously exported object
    this.type = aObject.type;
    this.name = aObject.name;
    this.x1 = aObject.x1;
    this.y1 = aObject.y1;
    this.x2 = aObject.x2;
    this.y2 = aObject.y2;
    this.value = aObject.value;
    this.pinout = aObject.pinout;
    this.flipped = aObject.flipped;
    this.schematic = aObject.schematic;
};

SC.Dip.prototype.toNetlist = function () {
    // Return netlist object
    return {
        type: 'dip' + (2 * (this.y2 - this.y1 + 1)),
        name: this.name,
        value: this.value,
        pinout: this.pinout,
        schematic: this.schematic,
        nets: this.nets()
    };
};

SC.Dip.prototype.nets = function () {
    // Return nets connected to pins
    var a = [], i;
    if (this.flipped) {
        // key down (upside down)
        for (i = this.y2; i >= this.y1; i--) {
            a.push(SC.grid.net(this.x2, i));
        }
        for (i = this.y1; i <= this.y2; i++) {
            a.push(SC.grid.net(this.x1, i));
        }
    } else {
        // key up (normal)
        for (i = this.y1; i <= this.y2; i++) {
            a.push(SC.grid.net(this.x1, i));
        }
        for (i = this.y2; i >= this.y1; i--) {
            a.push(SC.grid.net(this.x2, i));
        }
    }
    return a;
};

SC.Dip.prototype.flip = function () {
    // Flip pins (polarity)
    this.flipped = !this.flipped;
};

SC.Dip.prototype.hasPin = function (aX, aY) {
    // Return true if given coords are at any of the pins
    return (aX === this.x1 || aX === this.x2) && (aY >= this.y1 && aY <= this.y2);
};

SC.Dip.prototype.distanceTo = function (aX, aY) {
    // Return distance to pins (so that user can select something underneath the package)
    return Math.min(
        CA.distancePointLineSegment(aX, aY, this.x1, this.y1, this.x1, this.y2),
        CA.distancePointLineSegment(aX, aY, this.x2, this.y1, this.x2, this.y2)
    );
};

SC.Dip.prototype.render = function (aContext) {
    // Render component
    this.flipped = this.y1 > this.y2;
    var x1 = 0, y1 = 0, x2 = 0, y2 = 0, a, b, aa, bb, i, pa, pb, kw, c;
    [x1, y1, x2, y2] = this.fixedOrientation();
    a = vec2(x1, y1);
    b = vec2(x2, y2);
    aa = vec2(x1 + 0.3, y1 - 0.5);
    bb = vec2(x2 - 0.3, y2 + 0.5);
    // screen coords
    a = SC.grid.gridToScreen(a.x, a.y);
    b = SC.grid.gridToScreen(b.x, b.y);
    aa = SC.grid.gridToScreen(aa.x, aa.y);
    bb = SC.grid.gridToScreen(bb.x, bb.y);
    // package
    aContext.globalAlpha = SC.show.components_opacity;
    aContext.lineWidth = 4 * SC.v.zoom;
    aContext.strokeStyle = 'black';
    aContext.strokeRect(aa.x, aa.y, bb.x - aa.x, bb.y - aa.y);
    // dots
    for (i = y1; i <= y2; i++) {
        pa = SC.grid.gridToScreen(x1, i);
        pb = SC.grid.gridToScreen(x2, i);
        aContext.fillStyle = '#0000ff';
        aContext.beginPath();
        aContext.arc(pa.x, pa.y, 4 * SC.v.zoom, 0, 2 * Math.PI, false);
        aContext.closePath();
        aContext.arc(pb.x, pb.y, 4 * SC.v.zoom, 0, 2 * Math.PI, false);
        aContext.fill();
    }
    // key
    aContext.lineWidth = 4 * SC.v.zoom;
    aContext.strokeStyle = 'black';
    kw = 0.1;
    if (x2 - x1 === 2) {
        kw = 0.3;
    }
    if (x2 - x1 > 2) {
        kw = 0.4;
    }
    if (this.flipped) {
        pa = SC.grid.gridToScreen((x1 + x2) / 2 - kw, y2 - 0.2);
        pb = SC.grid.gridToScreen((x1 + x2) / 2 + kw, y2 + 0.5);
    } else {
        pa = SC.grid.gridToScreen((x1 + x2) / 2 - kw, y1 - 0.5);
        pb = SC.grid.gridToScreen((x1 + x2) / 2 + kw, y1 + 0.2);
    }
    aContext.strokeRect(pa.x, pa.y, pb.x - pa.x, pb.y - pa.y);
    // name + value
    aContext.globalAlpha = 1;
    c = {x: (aa.x + bb.x) / 2, y: (aa.y + bb.y) / 2};
    aContext.font = 'bold 12px sans-serif';
    aContext.textBaseline = 'bottom';
    aContext.textAlign = 'center';
    aContext.strokeStyle = 'black';
    aContext.lineWidth = 2;
    aContext.fillStyle = 'white';
    aContext.strokeText(this.name, c.x, c.y);
    aContext.fillText(this.name, c.x, c.y);
    aContext.textBaseline = 'top';
    aContext.strokeText(this.value, c.x, c.y);
    aContext.fillText(this.value, c.x, c.y);
};

SC.Dip.prototype.fixedOrientation = function () {
    // Return x1,y1,x2,y2 in a way that x1,y1 is in top-left and x2,y2 in bottom-right
    return [
        Math.min(this.x1, this.x2),
        Math.min(this.y1, this.y2),
        Math.max(this.x1, this.x2),
        Math.max(this.y1, this.y2)
    ];
};

SC.Dip.prototype.propertiesDialog = function (aCallback) {
    // Show properties dialog
    [this.x1, this.y1, this.x2, this.y2] = this.fixedOrientation();
    // dialog
    var t = this,
        size = (Math.abs(this.x2 - this.x1) + 1) + 'x' + (Math.abs(this.y2 - this.y1) + 1),
        dlg = CA.modalDialog(t.type + ' (' + size + ')', '', ['Save', 'Cancel'], function (aButton) {
            if (aButton === 'Save') {
                t.name = dlg.name.input.value;
                t.value = dlg.value.input.value;
                t.pinout = dlg.pinout.input.value;
                t.schematic = dlg.schematic.input.value;
            }
            SC.render();
            if (aCallback) {
                aCallback(aButton, t);
            }
        });
    dlg.div.style.position = 'fixed';
    dlg.div.style.top = '1cm';
    // value
    dlg.value = CA.labelInput(dlg.content, 'Value', CA.select(['Custom'].concat(Object.keys(SC.specsDip[size] || {}).sort()), false), '');
    dlg.value.input.value = t.value;
    dlg.value.input.onchange = function () {
        var s, b = SC.specsDip[size] && SC.specsDip[size][dlg.value.input.value] && dlg.value.input.value !== 'Custom';
        dlg.pinout.input.disabled = b;
        if (b) {
            // fill pinout
            dlg.pinout.input.value = SC.specsDip[size][dlg.value.input.value].pinout;
            // enable options in schematics select
            s = (SC.specsDip[size][dlg.value.input.value].schematic || '').split(',');
            if (s) {
                CA.selectEnableOptions(dlg.schematic.input, s);
            }
        } else {
            // custom allows all schematics, user knows what he is doing
            CA.selectEnableOptions(dlg.schematic.input, true);
        }
    };

    // name
    dlg.name = CA.labelInput(dlg.content, 'Name', t.name, null);
    dlg.name.input.value = t.name;
    // pinout
    dlg.pinout = CA.labelInput(dlg.content, 'Pinout', 'text', ' ');
    dlg.pinout.input.value = t.pinout;
    dlg.pinout.units.style.display = 'none';
    dlg.pinout.input.size = 6 * 2 * (this.y2 - this.y1);
    // pinout
    dlg.schematic = CA.labelInput(dlg.content, 'Schematic', CA.select({
        'dip': 'DIP',
        'dip8_opamp_single': 'DIP8 with single opamp',
        'dip8_opamp_dual': 'DIP8 with dual opamp',
        'dip14_opamp_quad': 'DIP with quad opamp',
        'opamp_single': 'Opamp 1 triangle',
        'opamp_single_offset': 'Opamp 1 triangle + offset circuit',
        'opamp_dual': 'Opamp 2 triangles',
        'opamp_quad': 'Opamp 4 triangles',
        'ota_dual': 'OTA 2 triangles + 2 buffers',
    }), ' ');
    dlg.schematic.input.value = t.schematic;
    if (SC.specsDip[size] && SC.specsDip[size][dlg.value.input.value]) {
        CA.selectEnableOptions(dlg.schematic.input, SC.specsDip[size][dlg.value.input.value].schematic.split(','));
    } else {
        CA.selectEnableOptions(dlg.schematic.input, true);
    }
    dlg.schematic.units.style.display = 'none';
    dlg.value.input.onchange();
    dlg.value.input.focus();
    window.d = dlg;
    return dlg;
};
