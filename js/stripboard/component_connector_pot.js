// Single pin of external potentiometer (one of 3) connected to the edge of the stripboard
"use strict";
// globals: document, window, CA

var SC = window.SC || {};

SC.ConnectorPot = function (aName, aX1, aY1, aX2, aY2) {
    this.is_connector = true;
    this.type = 'connector_pot';
    this.name = aName;
    this.x1 = aX1 || 0;
    this.y1 = aY1 || 0;
    this.x2 = aX2 || 0;
    this.y2 = aY2 || 0;
    this.value = '50k';
    this.pot_start = false;
    this.pot_wiper = false;
    this.pot_end = false;
};

SC.factory.connector_pot = SC.ConnectorPot;
SC.namingPrefix.connector = 'P';

SC.ConnectorPot.prototype.toObject = function () {
    // Return exportable object
    return {
        type: this.type,
        name: this.name,
        x1: this.x1,
        y1: this.y1,
        x2: this.x2,
        y2: this.y2,
        pot_start: this.pot_start,
        pot_wiper: this.pot_wiper,
        pot_end: this.pot_end,
        value: this.value
    };
};

SC.ConnectorPot.prototype.fromObject = function (aObject) {
    // Set this from previously exported object
    this.name = aObject.name;
    this.x1 = aObject.x1;
    this.y1 = aObject.y1;
    this.x2 = aObject.x2;
    this.y2 = aObject.y2;
    this.pot_start = aObject.pot_start;
    this.pot_wiper = aObject.pot_wiper;
    this.pot_end = aObject.pot_end;
    this.value = aObject.value;
};

SC.ConnectorPot.prototype.toNetlist = function () {
    // Netlist of external pots are made by merging 2~3 ConnectorPot in netlist.js
    return;
};

SC.ConnectorPot.prototype.nets = function () {
    // Return nets connected to pins
    return [
        SC.grid.net(this.x1, this.y1)
    ];
};

SC.ConnectorPot.prototype.hasPin = function (aX, aY) {
    // Return true if given coords are at any of the pins
    return (this.x1 === aX) && (this.y1 === aY);
};

SC.ConnectorPot.prototype.fixPinOrder = function (aDialog) {
    // Connector must start on board and end outside board, if it is other way around fix it
    return SC.components.fixPinOrder(this, aDialog);
};

SC.ConnectorPot.prototype.distanceTo = function (aX, aY) {
    // Return distance to given point on grid
    return CA.distancePointLineSegment(aX, aY, this.x1, this.y1, this.x2, this.y2);
};

SC.ConnectorPot.prototype.render = function (aContext) {
    // Render connector
    var a = SC.grid.gridToScreen(this.x1, this.y1, true),
        b = SC.grid.gridToScreen(this.x2, this.y2, true),
        px,
        py,
        line_width = 4 * SC.v.zoom,
        pot = ' ' + (this.pot_start ? '1=start ' : '') + (this.pot_wiper ? '2=wiper ' : '') + (this.pot_end ? '3=end ' : '');
    if (this.value) {
        pot += ' ' + this.value + 'Ω';
    }
    // name + pot pins
    aContext.globalAlpha = 1;
    aContext.font = 'bold 12px sans-serif';
    aContext.fillStyle = 'black';
    aContext.lineWidth = 1;
    aContext.strokeStyle = 'white';
    aContext.textBaseline = 'middle';
    if (this.x1 === 0) {
        aContext.textAlign = 'right';
        aContext.strokeText(this.name + pot + '  ', b.x - line_width - (2 * line_width - 4), b.y);
        aContext.fillText(this.name + pot + '  ', b.x - line_width - (2 * line_width - 4), b.y);
        px = b.x - 2 * line_width - line_width;
        py = Math.round(b.y - line_width);
    } else {
        aContext.textAlign = 'left';
        aContext.strokeText(this.name + pot, b.x + line_width + (2 * line_width + 4), b.y);
        aContext.fillText(this.name + pot, b.x + line_width + (2 * line_width + 4), b.y);
        px = b.x + line_width;
        py = Math.round(b.y - line_width);
    }
    // line
    aContext.globalAlpha = 0.5;
    aContext.lineCap = 'round';
    aContext.lineWidth = line_width;
    aContext.strokeStyle = 'black';
    aContext.beginPath();
    aContext.moveTo(a.x, a.y);
    aContext.lineTo(b.x, b.y);
    aContext.stroke();
    aContext.globalAlpha = 1;
    aContext.fillStyle = '#ff000077';
    // mini pot images
    if (this.pot_start) {
        aContext.drawImage(SC.image.pot_start, px, py, 2 * line_width, 2 * line_width);
    }
    if (this.pot_wiper) {
        aContext.drawImage(SC.image.pot_wiper, px, py, 2 * line_width, 2 * line_width);
    }
    if (this.pot_end) {
        aContext.drawImage(SC.image.pot_end, px, py, 2 * line_width, 2 * line_width);
    }
};

SC.ConnectorPot.prototype.propertiesDialog = function (aCallback) {
    // Show properties dialog
    var t = this, d = SC.propertiesDialog(this, 'Ω', function (aButton) {
        aCallback(aButton);
        if (aButton === 'Save') {
            t.pot_start = d.pot_start.input.checked;
            t.pot_wiper = d.pot_wiper.input.checked;
            t.pot_end = d.pot_end.input.checked;
        }
        SC.render();
    });
    d.dlg.h1.textContent = 'Connector for pot';
    d.value.label.textContent = 'Resistance';
    d.pot_start = CA.labelCheckboxLabel(d.dlg.content, 'Pin 1', this.pot_start, 'start');
    d.pot_wiper = CA.labelCheckboxLabel(d.dlg.content, 'Pin 2', this.pot_wiper, 'wiper');
    d.pot_end = CA.labelCheckboxLabel(d.dlg.content, 'Pin 3', this.pot_end, 'end');
    return d;
};

