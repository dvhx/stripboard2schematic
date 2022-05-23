// SPDT Switch connector
"use strict";
// globals: document, window, CA

var SC = window.SC || {};

SC.ConnectorSwitchSPDT = function (aName, aX1, aY1, aX2, aY2) {
    this.is_connector = true;
    this.type = 'connector_switch_spdt';
    this.name = aName;
    this.x1 = aX1 || 0;
    this.y1 = aY1 || 0;
    this.x2 = aX2 || 0;
    this.y2 = aY2 || 0;
    this.pin = 0;
};

SC.factory.connector_switch_spdt = SC.ConnectorSwitchSPDT;
SC.namingPrefix.connector_switch_spdt = '';

SC.ConnectorSwitchSPDT.PIN_NAMES = {
    0: '',
    1: 'Input',
    2: 'Output A',
    3: 'Output B'
};

SC.ConnectorSwitchSPDT.prototype.toObject = function () {
    // Return exportable object
    return {
        type: this.type,
        name: this.name,
        x1: this.x1,
        y1: this.y1,
        x2: this.x2,
        y2: this.y2,
        pin: this.pin
    };
};

SC.ConnectorSwitchSPDT.prototype.fromObject = function (aObject) {
    // Set this from previously exported object
    this.name = aObject.name;
    this.x1 = aObject.x1;
    this.y1 = aObject.y1;
    this.x2 = aObject.x2;
    this.y2 = aObject.y2;
    this.pin = aObject.pin;
};

SC.ConnectorSwitchSPDT.prototype.toNetlist = function () {
    // Netlist of external SwitchSPDT are made by merging few ConnectorSwitchSPDT in netlist.js
    return;
};

SC.ConnectorSwitchSPDT.prototype.nets = function () {
    // Return nets connected to pins
    return [
        SC.grid.net(this.x1, this.y1)
    ];
};

SC.ConnectorSwitchSPDT.prototype.hasPin = function (aX, aY) {
    // Return true if given coords are at any of the pins, only start of connector is considered "real"
    return (this.x1 === aX) && (this.y1 === aY);
};

SC.ConnectorSwitchSPDT.prototype.fixPinOrder = function (aDialog) {
    // Connector must start on board and end outside board, if it is other way around fix it
    return SC.components.fixPinOrder(this, aDialog);
};

SC.ConnectorSwitchSPDT.prototype.distanceTo = function (aX, aY) {
    // Return distance to given point on grid
    return CA.distancePointLineSegment(aX, aY, this.x1, this.y1, this.x2, this.y2);
};

SC.ConnectorSwitchSPDT.prototype.render = function (aContext) {
    // Render connector
    var a = SC.grid.gridToScreen(this.x1, this.y1, true),
        b = SC.grid.gridToScreen(this.x2, this.y2, true),
        line_width = 4 * SC.v.zoom;
    // name
    aContext.globalAlpha = 1;
    aContext.font = 'bold 12px sans-serif';
    aContext.fillStyle = 'black';
    aContext.lineWidth = 1;
    aContext.strokeStyle = 'white';
    aContext.textBaseline = 'middle';
    if (this.x1 === 0) {
        aContext.textAlign = 'right';
        aContext.strokeText(this.name + ' ' + SC.ConnectorSwitchSPDT.PIN_NAMES[this.pin], b.x - line_width - (2 * line_width - 4), b.y);
        aContext.fillText(this.name + ' ' + SC.ConnectorSwitchSPDT.PIN_NAMES[this.pin], b.x - line_width - (2 * line_width - 4), b.y);
    } else {
        aContext.textAlign = 'left';
        aContext.strokeText(this.name + ' ' + SC.ConnectorSwitchSPDT.PIN_NAMES[this.pin], b.x + line_width + (2 * line_width + 4), b.y);
        aContext.fillText(this.name + ' ' + SC.ConnectorSwitchSPDT.PIN_NAMES[this.pin], b.x + line_width + (2 * line_width + 4), b.y);
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
};

SC.ConnectorSwitchSPDT.prototype.propertiesDialog = function (aCallback) {
    // Show properties dialog
    var t = this, d = SC.propertiesDialog(this, '', function (aButton) {
        aCallback(aButton);
        if (aButton === 'Save') {
            t.pin = d.pin.input.value;
        }
        SC.render();
    });
    d.dlg.h1.textContent = 'Connector for SPDT switch';

    d.pin = CA.labelInput(d.dlg.content, 'Pin', CA.select(SC.ConnectorSwitchSPDT.PIN_NAMES));
    d.pin.input.value = t.pin;

    d.img = document.createElement('img');
    d.img.src = 'image/stripboard/spdt.png';
    d.img.style.marginLeft = CA.labelInputLabels[0].clientWidth + 'px';
    d.dlg.content.appendChild(d.img);

    return d;
};

