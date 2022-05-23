// Transistor (or anything with linear 3-pin span in TO-92, TO-126 or TO-220, e.g. regulators)
"use strict";
// globals: document, window, CA, vec2

var SC = window.SC || {};

SC.Transistor = function (aName, aX1, aY1, aX2, aY2) {
    this.type = 'transistor';
    this.name = aName;
    this.x1 = aX1 || 0;
    this.y1 = aY1 || 0;
    this.x2 = aX2 || 0;
    this.y2 = aY2 || 0;
    this.kind = 'NPN';
    this.model = '2N2222';
    this.package = 'TO-92';
    this.pinout = 'EBC';
};

SC.factory.transistor = SC.Transistor;
SC.namingPrefix.transistor = 'Q';

SC.Transistor.prototype.toObject = function () {
    // Return exportable object
    return {
        type: this.type,
        name: this.name,
        x1: this.x1,
        y1: this.y1,
        x2: this.x2,
        y2: this.y2,
        kind: this.kind,
        model: this.model,
        package: this.package,
        pinout: this.pinout
    };
};

SC.Transistor.prototype.fromObject = function (aObject) {
    // Set this from previously exported object
    this.type = aObject.type;
    this.name = aObject.name;
    this.x1 = aObject.x1;
    this.y1 = aObject.y1;
    this.x2 = aObject.x2;
    this.y2 = aObject.y2;
    this.kind = aObject.kind;
    this.model = aObject.model;
    this.package = aObject.package;
    this.pinout = aObject.pinout;
};

SC.Transistor.prototype.validator = function () {
    // Return true if transistor spans exactly 3 strips
    return CA.distance(this.x1, this.y1, this.x2, this.y2) === 2;
};

SC.Transistor.prototype.toNetlist = function () {
    // Return netlist object with correct pin order C-B-E
    var n = this.nets(), o = {}, nets;
    o[this.pinout[0]] = n[0];
    o[this.pinout[1]] = n[1];
    o[this.pinout[2]] = n[2];
    // bipolar
    if (['NPN', 'PNP', 'NPN_DARLINGTON', 'PNP_DARLINGTON'].indexOf(this.kind) >= 0) {
        nets = [o.C, o.B, o.E];
    }
    // unipolar
    if (['N_MOSFET', 'P_MOSFET', 'N_JFET', 'P_JFET'].indexOf(this.kind) >= 0) {
        nets = [o.D, o.G, o.S];
    }
    // regulators
    if (['P_REGULATOR', 'N_REGULATOR'].indexOf(this.kind) >= 0) {
        nets = [o.I, o.G, o.O];
    }
    return {
        type: 'transistor_' + this.kind.toLowerCase(),
        name: this.name,
        value: this.model,
        nets: nets
    };
};

SC.Transistor.prototype.nets = function () {
    // Return nets connected to pins
    return [
        SC.grid.net(this.x1, this.y1),
        SC.grid.net(Math.round(this.x1 + this.x2) / 2, Math.round(this.y1 + this.y2) / 2),
        SC.grid.net(this.x2, this.y2)
    ];
};

SC.Transistor.prototype.flip = function () {
    // Flip pins (polarity)
    [this.x1, this.y1, this.x2, this.y2] = [this.x2, this.y2, this.x1, this.y1];
};

SC.Transistor.prototype.hasPin = function (aX, aY) {
    // Return true if given coords are at any of the pins
    return (this.x1 === aX && this.y1 === aY)
        || (this.x2 === aX && this.y2 === aY);
};

SC.Transistor.prototype.distanceTo = function (aX, aY) {
    // Return distance to given point on grid
    return CA.distancePointLineSegment(aX, aY, this.x1, this.y1, this.x2, this.y2);
};

SC.Transistor.prototype.render = function (aContext) {
    // Render component
    var a = SC.grid.gridToScreen(this.x1, this.y1),
        b = SC.grid.gridToScreen(this.x2, this.y2),
        c = {x: (a.x + b.x) / 2, y: (a.y + b.y) / 2},
        ofs;
    // check valid span
    aContext.globalAlpha = 1;
    if (!this.validator()) {
        aContext.strokeStyle = 'black';
        aContext.fillStyle = 'blue';
        aContext.font = 'bold 12px sans-serif';
        aContext.textBaseline = 'middle';
        aContext.textAlign = 'center';
        aContext.fillText('Transistor must span exactly 3 holes', c.x, c.y);
        aContext.beginPath();
        aContext.moveTo(a.x, a.y);
        aContext.lineTo(b.x, b.y);
        aContext.stroke();
        return;
    }
    // middle dot
    aContext.globalAlpha = SC.show.components_opacity;
    aContext.fillStyle = '#0000ff';
    aContext.beginPath();
    aContext.arc(c.x, c.y, 4 * SC.v.zoom, 0, 2 * Math.PI, false);
    aContext.fill();
    // package
    if (SC.image[this.package]) {
        SC.renderDefault(aContext, this.x1, this.y1, this.x2, this.y2, SC.image[this.package], this.name, this.model, 37, 37);
    }
    // pinout
    aContext.fillStyle = 'white';
    aContext.textBaseline = 'middle';
    aContext.textAlign = 'left';
    ofs = 12 * SC.v.zoom;
    aContext.strokeText(this.pinout.charAt(0), a.x + ofs, a.y);
    aContext.strokeText(this.pinout.charAt(1), c.x + ofs, c.y - ofs);
    aContext.strokeText(this.pinout.charAt(2), b.x + ofs, b.y);
    aContext.fillText(this.pinout.charAt(0), a.x + ofs, a.y);
    aContext.fillText(this.pinout.charAt(1), c.x + ofs, c.y - ofs);
    aContext.fillText(this.pinout.charAt(2), b.x + ofs, b.y);
};

SC.Transistor.prototype.propertiesDialog = function (aCallback) {
    // Show properties dialog
    var t = this, d = SC.propertiesDialog(this, '', function (aButton) {
        if (aButton === 'Save') {
            t.kind = d.kind.input.value;
            t.model = d.model.input.value;
            t.package = d.package.input.value;
            t.pinout = d.pinout.input.value;
        }
        if (aCallback) {
            aCallback(aButton);
        }
    });
    // model
    d.model = CA.labelInput(d.dlg.content, 'Model', CA.select(['Custom'].concat(Object.keys(SC.specsTransistor).sort())), ' ');
    d.model.input.value = t.model;
    d.model.div.style.marginBottom = '1ex';
    d.model.input.onchange = function () {
        // fill specs
        var s = SC.specsTransistor[d.model.input.value],
            b = s ? true : false;
        if (s) {
            d.kind.input.value = s.kind;
            d.package.input.value = s.package;
            d.pinout.input.value = s.pinout;
        }
        d.kind.input.disabled = b;
        d.package.input.disabled = b;
        d.pinout.input.disabled = b;
    };
    // kind
    d.kind = CA.labelInput(d.dlg.content, 'Kind', CA.select(['NPN', 'PNP', 'NPN_DARLINGTON', 'PNP_DARLINGTON', 'N_MOSFET', 'P_MOSFET', 'N_JFET', 'P_REGULATOR', 'N_REGULATOR']), ' ');
    d.kind.input.value = t.kind;
    // package
    d.package = CA.labelInput(d.dlg.content, 'Package', CA.select(['TO-92', 'TO-126', 'TO-220', 'OTHER']), ' ');
    d.package.input.value = t.package;
    // pinout
    d.pinout = CA.labelInput(d.dlg.content, 'Pinout', CA.select(['EBC', 'ECB', 'BEC', 'BCE', 'CEB', 'CBE', 'SGD', 'SDG', 'GSD', 'GDS', 'DSG', 'DGS', 'OGI', 'GIO', 'IGO']), ' ');
    d.pinout.input.value = t.pinout;
    // fill specs of current model
    d.model.input.onchange();
    return d;
};

