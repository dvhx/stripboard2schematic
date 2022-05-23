// Inductor
"use strict";
// globals: document, window, CA, vec2

var SC = window.SC || {};

SC.Inductor = function (aName, aX1, aY1, aX2, aY2) {
    this.type = 'inductor';
    this.name = aName;
    this.x1 = aX1 || 0;
    this.y1 = aY1 || 0;
    this.x2 = aX2 || 0;
    this.y2 = aY2 || 0;
    this.value = '10m';
};

SC.factory.inductor = SC.Inductor;
SC.namingPrefix.inductor = 'L';

SC.Inductor.prototype.toObject = function () {
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

SC.Inductor.prototype.fromObject = function (aObject) {
    // Set this from previously exported object
    this.type = aObject.type;
    this.name = aObject.name;
    this.x1 = aObject.x1;
    this.y1 = aObject.y1;
    this.x2 = aObject.x2;
    this.y2 = aObject.y2;
    this.value = aObject.value;
};

SC.Inductor.prototype.toNetlist = function () {
    // Return netlist object
    return {
        type: this.type,
        name: this.name,
        value: this.value,
        nets: this.nets()
    };
};

SC.Inductor.prototype.nets = function () {
    // Return nets connected to pins
    return [
        SC.grid.net(this.x1, this.y1),
        SC.grid.net(this.x2, this.y2)
    ];
};

SC.Inductor.prototype.flip = function () {
    // Flip pins (polarity)
    [this.x1, this.y1, this.x2, this.y2] = [this.x2, this.y2, this.x1, this.y1];
};

SC.Inductor.prototype.hasPin = function (aX, aY) {
    // Return true if given coords are at any of the pins
    return (this.x1 === aX && this.y1 === aY) || (this.x2 === aX && this.y2 === aY);
};

SC.Inductor.prototype.distanceTo = function (aX, aY) {
    // Return distance to given point on grid
    return CA.distancePointLineSegment(aX, aY, this.x1, this.y1, this.x2, this.y2);
};

SC.Inductor.prototype.render = function (aContext) {
    // Render component
    SC.renderDefault(aContext, this.x1, this.y1, this.x2, this.y2, SC.image.inductor, this.name, this.value, 49, 15);
};

SC.Inductor.prototype.propertiesDialog = function (aCallback) {
    // Show properties dialog
    return SC.propertiesDialog(this, 'H', aCallback);
};

