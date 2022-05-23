// LED
"use strict";
// globals: document, window, CA, vec2

var SC = window.SC || {};

SC.Led = function (aName, aX1, aY1, aX2, aY2) {
    this.type = 'led';
    this.name = aName;
    this.x1 = aX1 || 0;
    this.y1 = aY1 || 0;
    this.x2 = aX2 || 0;
    this.y2 = aY2 || 0;
    this.value = 'green';
};

SC.factory.led = SC.Led;
SC.namingPrefix.led = 'D';

SC.Led.prototype.toObject = function () {
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

SC.Led.prototype.fromObject = function (aObject) {
    // Set this from previously exported object
    this.type = aObject.type;
    this.name = aObject.name;
    this.x1 = aObject.x1;
    this.y1 = aObject.y1;
    this.x2 = aObject.x2;
    this.y2 = aObject.y2;
    this.value = aObject.value;
};

SC.Led.prototype.toNetlist = function () {
    // Return netlist object
    return {
        type: this.type,
        name: this.name,
        value: this.value,
        nets: this.nets()
    };
};

SC.Led.prototype.nets = function () {
    // Return nets connected to pins
    return [
        SC.grid.net(this.x1, this.y1),
        SC.grid.net(this.x2, this.y2)
    ];
};

SC.Led.prototype.flip = function () {
    // Flip pins (polarity)
    [this.x1, this.y1, this.x2, this.y2] = [this.x2, this.y2, this.x1, this.y1];
};

SC.Led.prototype.hasPin = function (aX, aY) {
    // Return true if given coords are at any of the pins
    return (this.x1 === aX && this.y1 === aY) || (this.x2 === aX && this.y2 === aY);
};

SC.Led.prototype.distanceTo = function (aX, aY) {
    // Return distance to given point on grid
    return CA.distancePointLineSegment(aX, aY, this.x1, this.y1, this.x2, this.y2);
};

SC.Led.prototype.render = function (aContext) {
    // Render component
    SC.renderDefault(aContext, this.x1, this.y1, this.x2, this.y2, SC.image.led, this.name, this.value, 49, 32);
};

SC.Led.prototype.propertiesDialog = function (aCallback) {
    // Show properties dialog
    return SC.propertiesDialog(this, '', aCallback);
};

