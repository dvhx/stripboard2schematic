// All components
"use strict";
// globals: document, window

var SC = window.SC || {};

SC.Components = function () {
    // Constructor
    this.item = [];
};

SC.Components.prototype.toObject = function () {
    // Return exportable object
    var i, o = {};
    o.item = [];
    for (i = 0; i < this.item.length; i++) {
        o.item.push(this.item[i].toObject());
    }
    return o;
};

SC.Components.prototype.fromObject = function (aObject) {
    // Set this from previously exported object
    var i, c;
    this.item = [];
    if (aObject.item) {
        for (i = 0; i < aObject.item.length; i++) {
            c = new SC.Component();
            c.fromObject(aObject.item[i]);
            this.item.push(c);
        }
    }
};

SC.Components.prototype.remove = function (aComponent) {
    // Remove component
    var i = this.item.indexOf(aComponent);
    if (i >= 0) {
        this.item.splice(i, 1);
    }
    SC.grid.updateNets();
};

SC.Components.prototype.render = function (aContext) {
    // Render all components
    var i;
    for (i = 0; i < this.item.length; i++) {
        this.item[i].render(aContext);
    }
};

SC.Components.prototype.findByName = function (aName) {
    // Find component by name
    var i;
    for (i = 0; i < this.item.length; i++) {
        if (this.item[i].name === aName) {
            return this.item[i];
        }
    }
};

SC.Components.prototype.findByXY = function (aX, aY) {
    // Find item directly over given coords
    var i, c;
    for (i = 0; i < this.item.length; i++) {
        c = this.item[i];
        if (aX >= c.x && aX < c.x + c.width && aY >= c.y && aY < c.y + c.height) {
            return c;
        }
    }
};

SC.Components.prototype.findByPin = function (aX, aY) {
    // Find item with pin directly over given coords
    var i, p, xy;
    for (i = 0; i < this.item.length; i++) {
        for (p = 0; p < this.item[i].pin.length; p++) {
            xy = this.item[i].pinXY(p, false);
            if (xy.x === aX && xy.y === aY) {
                return {
                    component: this.item[i],
                    pin: this.item[i].pin[p].pin,
                    index: this.item[i].pin[p].index
                };
            }
        }
    }
};

SC.Components.prototype.center = function () {
    // Find center point of all components (used in screenshots and after import)
    var i, c, minx = Number.MAX_VALUE, miny = Number.MAX_VALUE, maxx = -Number.MAX_VALUE, maxy = -Number.MAX_VALUE;
    for (i = 0; i < this.item.length; i++) {
        c = this.item[i].center();
        minx = Math.min(minx, c.x);
        miny = Math.min(miny, c.y);
        maxx = Math.max(maxx, c.x);
        maxy = Math.max(maxy, c.y);
    }
    return {
        x: (maxx + minx) / 2,
        y: (maxy + miny) / 2
    };
};

