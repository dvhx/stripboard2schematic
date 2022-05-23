// Connector comming out of edge of the stripboard, like a link but comes OUT of board and has a name
"use strict";
// globals: document, window, CA

var SC = window.SC || {};

SC.connectorNextName = '';

SC.Connector = function (aName, aX1, aY1, aX2, aY2) {
    this.is_connector = true;
    this.type = 'connector';
    this.name = SC.connectorNextName || aName;
    SC.connectorNextName = '';
    this.x1 = aX1 || 0;
    this.y1 = aY1 || 0;
    this.x2 = aX2 || 0;
    this.y2 = aY2 || 0;
};

SC.factory.connector = SC.Connector;
SC.namingPrefix.connector = 'X';

SC.Connector.prototype.toObject = function () {
    // Return exportable object
    return {
        type: this.type,
        name: this.name,
        x1: this.x1,
        y1: this.y1,
        x2: this.x2,
        y2: this.y2
    };
};

SC.Connector.prototype.fromObject = function (aObject) {
    // Set this from previously exported object
    this.name = aObject.name;
    this.x1 = aObject.x1;
    this.y1 = aObject.y1;
    this.x2 = aObject.x2;
    this.y2 = aObject.y2;
};

SC.Connector.prototype.toNetlist = function () {
    // Return netlist object
    if (this.name === 'Ground') {
        return {type: 'ground', name: "Ground", nets: this.nets()};
    }
    return {
        type: this.type,
        name: this.name,
        nets: this.nets()
    };
};

SC.Connector.prototype.nets = function () {
    // Return nets connected to pins
    this.x1 = this.x1 || 0;
    this.y1 = this.y1 || 0;
    return [
        SC.grid.net(this.x1, this.y1)
    ];
};

SC.Connector.prototype.hasPin = function (aX, aY) {
    // Return true if given coords are at any of the pins, only start of connector is considered "real"
    return (this.x1 === aX) && (this.y1 === aY);
};

SC.Connector.prototype.fixPinOrder = function (aDialog) {
    // Connector must start on board and end outside board, if it is other way around fix it
    return SC.components.fixPinOrder(this, aDialog);
};

SC.Connector.prototype.distanceTo = function (aX, aY) {
    // Return distance to this connector's line
    return CA.distancePointLineSegment(aX, aY, this.x1, this.y1, this.x2, this.y2);
};

SC.Connector.prototype.render = function (aContext) {
    // Render connector
    var a = SC.grid.gridToScreen(this.x1, this.y1, true),
        b = SC.grid.gridToScreen(this.x2, this.y2, true),
        line_width = 4 * SC.v.zoom,
        dx;
    // name
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
    aContext.strokeText(this.name, b.x + dx, b.y);
    aContext.fillText(this.name, b.x + dx, b.y);
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

SC.Connector.prototype.propertiesDialog = function (aCallback) {
    // Show properties dialog
    // Certain names don't show dialog
    if (this.name === 'Ground' || this.name === 'Input' || this.name === 'Output') {
        aCallback('Add');
        return;
    }
    return SC.propertiesDialog(this, '', aCallback);
};

