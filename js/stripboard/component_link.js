// Link connecting 2 pieces of copper
"use strict";
// globals: document, window, CA, vec2

var SC = window.SC || {};

SC.Link = function (aName, aX1, aY1, aX2, aY2) {
    this.type = 'link';
    this.name = aName;
    this.x1 = aX1 || 0;
    this.y1 = aY1 || 0;
    this.x2 = aX2 || 0;
    this.y2 = aY2 || 0;
};

SC.factory.link = SC.Link;
SC.namingPrefix.link = 'Link';

SC.Link.prototype.toObject = function () {
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

SC.Link.prototype.fromObject = function (aObject) {
    // Set this from previously exported object
    this.type = aObject.type;
    this.name = aObject.name;
    this.x1 = aObject.x1;
    this.y1 = aObject.y1;
    this.x2 = aObject.x2;
    this.y2 = aObject.y2;
};

SC.Link.prototype.toNetlist = function () {
    // Link defines which pieces of copper have same net id, link itself is not in netlist as a component
    return;
};

SC.Link.prototype.hasPin = function (aX, aY) {
    // Return true if given coords are at any of the pins
    return (this.x1 === aX && this.y1 === aY) || (this.x2 === aX && this.y2 === aY);
};

SC.Link.prototype.nets = function () {
    // Return nets connected to pins
    return [
        SC.grid.net(this.x1, this.y1),
        SC.grid.net(this.x2, this.y2)
    ];
};

SC.Link.prototype.distanceTo = function (aX, aY) {
    // Return distance to given point on grid
    return CA.distancePointLineSegment(aX, aY, this.x1, this.y1, this.x2, this.y2);
};

SC.Link.prototype.render = function (aContext) {
    // Render component
    var a = SC.grid.gridToScreen(this.x1, this.y1),
        b = SC.grid.gridToScreen(this.x2, this.y2);
    // dots
    aContext.fillStyle = '#0000ff77';
    aContext.beginPath();
    aContext.arc(a.x, a.y, 4 * SC.v.zoom, 0, 2 * Math.PI, false);
    aContext.closePath();
    aContext.arc(b.x, b.y, 4 * SC.v.zoom, 0, 2 * Math.PI, false);
    aContext.fill();
    // Link
    aContext.lineWidth = 4 * SC.v.zoom;
    aContext.strokeStyle = '#000000cc';
    aContext.beginPath();
    aContext.moveTo(a.x, a.y);
    aContext.lineTo(b.x, b.y);
    aContext.stroke();
};

SC.Link.prototype.propertiesDialog = function (aCallback) {
    // Link doesn't need dialog
    aCallback('Save');
};

