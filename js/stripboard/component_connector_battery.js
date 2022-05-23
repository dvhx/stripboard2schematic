// Connector for battery (has extra field for voltage)
"use strict";
// globals: document, window, CA

var SC = window.SC || {};

SC.ConnectorBattery = function (aName, aX1, aY1, aX2, aY2) {
    this.is_connector = true;
    this.type = 'connector_battery';
    this.name = aName;
    this.x1 = aX1 || 0;
    this.y1 = aY1 || 0;
    this.x2 = aX2 || 0;
    this.y2 = aY2 || 0;
    this.value = '';
};

SC.factory.connector_battery = SC.ConnectorBattery;
SC.namingPrefix.connector_battery = 'U';

SC.ConnectorBattery.prototype.toObject = function () {
    // Return exportable object
    return {
        type: this.type,
        name: this.name,
        x1: this.x1,
        y1: this.y1,
        x2: this.x2,
        y2: this.y2,
        value: this.value
    };
};

SC.ConnectorBattery.prototype.fromObject = function (aObject) {
    // Set this from previously exported object
    this.name = aObject.name;
    this.x1 = aObject.x1;
    this.y1 = aObject.y1;
    this.x2 = aObject.x2;
    this.y2 = aObject.y2;
    this.value = aObject.value;
};

SC.ConnectorBattery.prototype.toNetlist = function () {
    // Return netlist object (both are |9V| but -9 has flipped nets)
    return {
        type: 'dc_voltage_supply',
        name: this.name,
        nets: parseFloat(this.value) >= 0 ? [this.nets()[0], SC.components.groundNet()] : [SC.components.groundNet(), this.nets()[0]],
        value: Math.abs(parseFloat(this.value))
    };
};

SC.ConnectorBattery.prototype.nets = function () {
    // Return nets connected to pins
    this.x1 = this.x1 || 0;
    this.y1 = this.y1 || 0;
    return [
        SC.grid.net(this.x1, this.y1)
    ];
};

SC.ConnectorBattery.prototype.hasPin = function (aX, aY) {
    // Return true if given coords are at any of the pins
    return (this.x1 === aX) && (this.y1 === aY);
};

SC.ConnectorBattery.prototype.fixPinOrder = function (aDialog) {
    // Connector must start on board and end outside board, if it is other way around fix it
    return SC.components.fixPinOrder(this, aDialog);
};

SC.ConnectorBattery.prototype.distanceTo = function (aX, aY) {
    // Return distance to this connector line
    return CA.distancePointLineSegment(aX, aY, this.x1, this.y1, this.x2, this.y2);
};

SC.ConnectorBattery.prototype.render = function (aContext) {
    // Render connector
    var a = SC.grid.gridToScreen(this.x1, this.y1, true),
        b = SC.grid.gridToScreen(this.x2, this.y2, true),
        line_width = 4 * SC.v.zoom,
        dx;
    // name + value
    aContext.globalAlpha = 1;
    aContext.font = 'bold 12px sans-serif';
    aContext.fillStyle = 'black';
    aContext.strokeStyle = 'white';
    aContext.lineWidth = 1;
    aContext.textBaseline = 'middle';
    if (this.x1 === 0) {
        aContext.textAlign = 'right';
        dx = -line_width;
    } else {
        aContext.textAlign = 'left';
        dx = line_width;
    }
    aContext.strokeText(this.name + ' ' + (this.value ? this.value + 'V' : ''), b.x + dx, b.y);
    aContext.fillText(this.name + ' ' + (this.value ? this.value + 'V' : ''), b.x + dx, b.y);
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

SC.ConnectorBattery.prototype.propertiesDialog = function (aCallback) {
    // Show properties dialog
    var d = SC.propertiesDialog(this, 'V', aCallback);
    d.value.label.textContent = 'Voltage';
    CA.labelInputLabelsSameWidth();
    return d;
};

