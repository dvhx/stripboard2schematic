// All Guides (guide points where net should go)
"use strict";
// globals: document, window, CA

var SC = window.SC || {};

SC.Guides = function () {
    // Constructor
    this.item = [];
};

SC.Guides.prototype.toObject = function () {
    // Return exportable object
    var i, o = {};
    o.item = [];
    for (i = 0; i < this.item.length; i++) {
        o.item.push(this.item[i].toObject());
    }
    return o;
};

SC.Guides.prototype.fromObject = function (aObject) {
    // Set this from previously exported object
    var i, c;
    this.item = [];
    if (aObject.item) {
        for (i = 0; i < aObject.item.length; i++) {
            c = new SC.Guide();
            c.fromObject(aObject.item[i]);
            this.item.push(c);
        }
    }
};

SC.Guides.prototype.add = function (aX, aY) {
    // Add Guide at given coordinates (to a nearest net)
    var i, v, n;
        v = new SC.Guide(0, Math.round(aX), Math.round(aY)),
        n = SC.nets.nearest(aX, aY);
    v.net = n.net.id;
    // don't add same Guide twice
    for (i = 0; i < this.item.length; i++) {
        if (this.item[i].x === v.x && this.item[i].y === v.y) { // && this.item[i].net === v.net
            // but still return Guide in case I need net id
            return v;
        }
    }
    this.item.push(v);
    return v;
};

SC.Guides.prototype.remove = function (aGuide) {
    // Remove Guide
    var i = this.item.indexOf(aGuide);
    if (i >= 0) {
        this.item.splice(i, 1);
    }
};

SC.Guides.prototype.render = function (aContext) {
    // Render all Guides
    var i;
    for (i = 0; i < this.item.length; i++) {
        this.item[i].render(aContext);
    }
};

SC.Guides.prototype.cacheXY = function () {
    // Create [x y] cache of Guides, used for adding guide wire efficiently
    var i, o = {};
    for (i = 0; i < this.item.length; i++) {
        o[this.item[i].x + ' ' + this.item[i].y] = this.item[i];
    }
    return o;
};

SC.Guides.prototype.findByXY = function (aX, aY) {
    // Find item directly over given integer coords
    var i, c;
    for (i = 0; i < this.item.length; i++) {
        c = this.item[i];
        if (aX === c.x && aY === c.y) {
            return c;
        }
    }
};

SC.Guides.prototype.findNearest = function (aX, aY) {
    // Find nearest Guide to float coordinates
    var i, d, m = Number.MAX_VALUE, best;
    for (i = 0; i < this.item.length; i++) {
        d = CA.distance(aX, aY, this.item[i].x, this.item[i].y);
        if (d < m) {
            m = d;
            best = this.item[i];
        }
    }
    return {
        distance: m,
        item: best
    };
};

SC.Guides.prototype.addToPoints = function (aNetId, aPoints) {
    // To aPoints array, add all Guides with given net id
    var i;
    for (i = 0; i < this.item.length; i++) {
        if (this.item[i].net === aNetId) {
            aPoints.push({x: this.item[i].x, y: this.item[i].y});
        }
    }
};

SC.Guides.prototype.removeXYNet = function (aX, aY, aNet) {
    // Remove nearest Guide (within 1 cell) at given coordinates but only if same as net
    var i;
    for (i = this.item.length - 1; i >= 0; i--) {
        if (this.item[i].net === aNet) {
            if (CA.distance(aX, aY, this.item[i].x, this.item[i].y) <= 0.5) {
                this.item.splice(i, 1);
            }
        }
    }
};

SC.Guides.prototype.removePinGuide = function (aComponent) {
    // After component is moved, if any pin is at Guide, remove the Guide to prevent the "ball"
    // I decided no to use this, it messed up accidental movement of components
    var i, p, pin, v;
    for (p = 0; p < aComponent.pin.length; p++) {
        pin = aComponent.pinXY(p);
        // check all Guides
        for (i = this.item.length - 1; i >= 0; i--) {
            v = this.item[i];
            // same position as pin and same net
            if (v.x === pin.x && v.y === pin.y && v.net === aComponent.pinNet[p]) {
                //console.log('removing Guide', v);
                this.item.splice(i, 1);
            }
        }
    }
};

SC.Guides.prototype.removeGuidesOnPins = function (aGuideCacheXY) {
    // After finish drawing one guide wire, check if any Guides were added at pins and if so remove them as there would be ball
    var k, c = aGuideCacheXY;
    for (k in c) {
        if (c.hasOwnProperty(k)) {
            if (SC.components.findByPin(c[k].x, c[k].y)) {
                this.remove(c[k]);
            }
        }
    }
};
