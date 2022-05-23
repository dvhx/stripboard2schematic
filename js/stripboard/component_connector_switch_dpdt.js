// DPDT Switch connector
"use strict";
// globals: document, window, CA

var SC = window.SC || {};

SC.ConnectorSwitchDPDT = function (aName, aX1, aY1, aX2, aY2) {
    this.is_connector = true;
    this.type = 'connector_switch_dpdt';
    this.name = aName;
    this.x1 = aX1 || 0;
    this.y1 = aY1 || 0;
    this.x2 = aX2 || 0;
    this.y2 = aY2 || 0;
    this.pin = 0;
    this.schematic = SC.ConnectorSwitchDPDT.recentSchematic || 'dpdt1';
};

SC.factory.connector_switch_dpdt = SC.ConnectorSwitchDPDT;
SC.namingPrefix.connector_switch_dpdt = '';

SC.ConnectorSwitchDPDT.PIN_NAMES = {
    0: 'Not Connected',
    1: 'Pin 1 - Output A1',
    2: 'Pin 2 - Input A',
    3: 'Pin 3 - Output A2',
    4: 'Pin 4 - Output B2',
    5: 'Pin 5 - Input B',
    6: 'Pin 6 - Output B1'
};

SC.ConnectorSwitchDPDT.prototype.toObject = function () {
    // Return exportable object
    return {
        type: this.type,
        name: this.name,
        x1: this.x1,
        y1: this.y1,
        x2: this.x2,
        y2: this.y2,
        pin: this.pin,
        schematic: this.schematic
    };
};

SC.ConnectorSwitchDPDT.prototype.fromObject = function (aObject) {
    // Set this from previously exported object
    this.name = aObject.name;
    this.x1 = aObject.x1;
    this.y1 = aObject.y1;
    this.x2 = aObject.x2;
    this.y2 = aObject.y2;
    this.pin = aObject.pin;
    this.schematic = aObject.schematic;
};

SC.ConnectorSwitchDPDT.prototype.toNetlist = function () {
    // Netlist of external SwitchDPDT are made by merging few ConnectorSwitchDPDT in netlist.js
    return;
};

SC.ConnectorSwitchDPDT.prototype.nets = function () {
    // Return nets connected to pins
    return [
        SC.grid.net(this.x1, this.y1)
    ];
};

SC.ConnectorSwitchDPDT.prototype.hasPin = function (aX, aY) {
    // Return true if given coords are at any of the pins, only start of connector is considered "real"
    return (this.x1 === aX) && (this.y1 === aY);
};

SC.ConnectorSwitchDPDT.prototype.fixPinOrder = function (aDialog) {
    // Connector must start on board and end outside board, if it is other way around fix it
    return SC.components.fixPinOrder(this, aDialog);
};

SC.ConnectorSwitchDPDT.prototype.distanceTo = function (aX, aY) {
    // Return distance to given point on grid
    return CA.distancePointLineSegment(aX, aY, this.x1, this.y1, this.x2, this.y2);
};

SC.ConnectorSwitchDPDT.prototype.render = function (aContext) {
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
        aContext.strokeText(this.name + ' (' + SC.ConnectorSwitchDPDT.PIN_NAMES[this.pin] + ')', b.x - line_width - (2 * line_width - 4), b.y);
        aContext.fillText(this.name + ' (' + SC.ConnectorSwitchDPDT.PIN_NAMES[this.pin] + ')', b.x - line_width - (2 * line_width - 4), b.y);
    } else {
        aContext.textAlign = 'left';
        aContext.strokeText(this.name + ' (' + SC.ConnectorSwitchDPDT.PIN_NAMES[this.pin] + ')', b.x + line_width + (2 * line_width + 4), b.y);
        aContext.fillText(this.name + ' (' + SC.ConnectorSwitchDPDT.PIN_NAMES[this.pin] + ')', b.x + line_width + (2 * line_width + 4), b.y);
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

SC.ConnectorSwitchDPDT.prototype.propertiesDialog = function (aCallback) {
    // Show properties dialog
    var t = this, on = this.name, d = SC.propertiesDialog(this, '', function (aButton) {
        // name must be set
        if (d.name.input.value === '') {
            alert('Name is required');
            d.name.input.focus();
            return false;
        }
        aCallback(aButton);
        if (aButton === 'Save') {
            t.pin = d.pin.input.value;
            t.schematic = d.schematic.input.value;
            SC.ConnectorSwitchDPDT.recentSchematic = t.schematic;
            // trickle down value to other pins
            SC.components.sameNameUpdateProperty(t.name, 'schematic', t.schematic);
            SC.components.sameNameUpdateProperty(on, 'name', t.name);
        }
        SC.render();
    });
    d.dlg.h1.textContent = 'Connector for DPDT switch';

    d.schematic = CA.labelInput(d.dlg.content, 'Schematic', CA.select(['dpdt1', 'dpdt2']));
    d.schematic.input.value = t.schematic;

    d.pin = CA.labelInput(d.dlg.content, 'Pin', CA.select(SC.ConnectorSwitchDPDT.PIN_NAMES));
    d.pin.input.value = t.pin;

    d.dlg.content.appendChild(document.createTextNode('v1:'));

    d.img = document.createElement('img');
    d.img.src = 'image/schematic/dpdt1.png';
    d.img.style.marginLeft = '1ex';
    d.img.style.marginRight = '2ex';
    d.dlg.content.appendChild(d.img);

    d.dlg.content.appendChild(document.createTextNode('v2:'));

    d.img = document.createElement('img');
    d.img.src = 'image/schematic/dpdt2.png';
    d.img.style.marginLeft = '1ex';
    d.dlg.content.appendChild(d.img);

    return d;
};

