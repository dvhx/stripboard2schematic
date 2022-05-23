// All components
"use strict";
// globals: document, window

var SC = window.SC || {};

SC.Components = function () {
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
    var i, c, t;
    this.item = [];
    if (aObject.item) {
        for (i = 0; i < aObject.item.length; i++) {
            t = aObject.item[i].type;
            if (!SC.factory[t]) {
                throw 'No factory for ' + t;
            }
            c = new SC.factory[t]();
            c.fromObject(aObject.item[i]);
            this.item.push(c);
        }
    }
};

SC.Components.prototype.add = function (aType, aX, aY) {
    // Add component of given type at given position
    var c;
    if (!SC.factory[aType]) {
        throw "No factory for " + aType;
    }
    c = new SC.factory[aType](SC.components.nextName(aType), aX, aY);
    c.type = aType;
    this.item.push(c);
    SC.grid.updateNets();
    return c;
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
        if (SC.show.components || (this.item[i] instanceof SC.Link)) {
            this.item[i].render(aContext);
        }
    }
};

SC.Components.prototype.nextName = function (aType) {
    // Assign next available name for component of given type
    if (SC.namingPrefix[aType] === '') {
        return '';
    }
    var i, c, m = 0;
    for (i = 0; i < this.item.length; i++) {
        if (SC.namingPrefix[this.item[i].type] === SC.namingPrefix[aType]) {
            c = this.item[i].name.match(/[0-9]+/);
            if (c) {
                m = Math.max(m, parseInt(c[0], 10));
            }
        }
    }
    return (SC.namingPrefix[aType] || 'X') + (m + 1);
};

SC.Components.prototype.findByName = function (aName) {
    // Find first component with this name
    var i;
    for (i = 0; i < this.item.length; i++) {
        if (this.item[i].name === aName) {
            return this.item[i];
        }
    }
};

SC.Components.prototype.findByXY = function (aX, aY) {
    // Find component that has pin at given coordinates
    var i;
    for (i = 0; i < this.item.length; i++) {
        if (this.item[i].hasPin(aX, aY)) {
            return this.item[i];
        }
    }
};

SC.Components.prototype.findNearest = function (aX, aY, aClass) {
    // Find component nearest to given coords, optional filter for class
    var i, d, m = Number.MAX_VALUE, best;
    for (i = 0; i < this.item.length; i++) {
        if (aClass && !(this.item[i] instanceof aClass)) {
            continue;
        }
        d = this.item[i].distanceTo(aX, aY);
        if (d < m) {
            m = d;
            best = this.item[i];
        }
    }
    return {
        distance: m,
        component: best
    };
};

SC.Components.prototype.groundNet = function () {
    // Find ground net id
    var i;
    for (i = 0; i < this.item.length; i++) {
        if (this.item[i] instanceof SC.Connector && this.item[i].name === 'Ground') {
            return this.item[i].nets()[0];
        }
    }
};

SC.Components.prototype.fixPinOrder = function (aComponent, aDialog) {
    // For components that have x1,y1,x2,y2 make sure x1,y1 is on board and x2,y2 outside
    var x, y;
    // must start on board
    if (!SC.grid.onBoard(aComponent.x1, aComponent.y1)) {
        x = aComponent.x1;
        y = aComponent.y1;
        aComponent.x1 = aComponent.x2;
        aComponent.y1 = aComponent.y2;
        aComponent.x2 = x;
        aComponent.y2 = y;
    }
    if (!SC.grid.onBoard(aComponent.x1, aComponent.y1)) {
        if (aDialog) {
            alert('Connector must START on the board');
        }
        return false;
    }
    if (SC.grid.onBoard(aComponent.x2, aComponent.y2)) {
        if (aDialog) {
            alert('Connector must END outside the board');
        }
        return false;
    }
    //console.log(aComponent.x1, aComponent.y1, aComponent.x2, aComponent.y2);
    return true;
};

SC.Components.prototype.sameNameUpdateProperty = function (aName, aProperty, aValue) {
    // For switch connectors update property of a components with the same values
    var i;
    for (i = 0; i < this.item.length; i++) {
        if (this.item[i].name === aName) {
            this.item[i][aProperty] = aValue;
        }
    }
};

