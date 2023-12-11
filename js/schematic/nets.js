// All nets
"use strict";
// globals: document, window, CA

var SC = window.SC || {};

SC.Nets = function () {
    // Constructor
    this.item = [];
};

SC.Nets.prototype.toObject = function () {
    // Return exportable object
    var i, r = {item: []};
    for (i = 0; i < this.item.length; i++) {
        r.item.push(this.item[i].toObject());
    }
    return r;
};

SC.Nets.prototype.fromObject = function (aObject) {
    // Set this from previously exported object
    var i, o;
    this.item = [];
    for (i = 0; i < aObject.item.length; i++) {
        o = new SC.Net();
        o.fromObject(aObject.item[i]);
        this.item.push(o);
    }
};

SC.Nets.prototype.render = function (aContext) {
    // Render all nets
    var i, j, k, l, p, a, b, s, t, z, size = 8 * SC.v.zoom / SC.gridSize;
    // nets
    this.total_length = 0;
    for (i = 0; i < this.item.length; i++) {
        this.total_length += this.item[i].render(aContext);
    }
    // show red squares where different nets cross
    this.intersects = 0;
    if (SC.show.net_crossings) {
        if (aContext) {
            aContext.strokeStyle = 'red';
            aContext.lineWidth = 1;
        }
        // all nets
        for (i = 0; i < this.item.length - 1; i++) {
            a = this.item[i];
            // against all other nets
            for (j = i + 1; j < this.item.length; j++) {
                b = this.item[j];
                // find intersections of all segments of both nets
                for (k = 0; k < a.kruskal.length; k++) {
                    for (l = 0; l < b.kruskal.length; l++) {
                        s = a.kruskal[k];
                        t = b.kruskal[l];
                        p = CA.lineIntersection(s.x1, s.y1, s.x2, s.y2, t.x1, t.y1, t.x2, t.y2);
                        //console.log(s.x1, s.y1, s.x2, s.y2, t.x1, t.y1, t.x2, t.y2)
                        //console.log(p);
                        if (p && p.intersects) {
                            if (aContext) {
                                // draw red box
                                z = SC.v.canvasToScreen(p.x, p.y);
                                aContext.strokeRect(z.x - size / 2, z.y - size / 2, size, size);
                                // collinear may intersects in 2 points
                                if (p.hasOwnProperty('x2')) {
                                    z = SC.v.canvasToScreen(p.x2, p.y2);
                                    aContext.strokeRect(z.x - size / 2, z.y - size / 2, size, size);
                                    this.intersects++;
                                }
                            }
                            this.intersects++;
                        }
                    }
                }
            }
        }
    }
};

SC.Nets.prototype.nearest = function (aX, aY) {
    // Find nearest net
    var d, m = Number.MAX_VALUE, i, best;
    for (i = 0; i < this.item.length; i++) {
        d = this.item[i].distanceTo(aX, aY);
        if (d < m) {
            m = d;
            best = this.item[i];
        }
    }
    return {
        net: best,
        distance: m
    };
};

SC.Nets.prototype.addComponentPin = function (aNet, aComponent, aPin) {
    // Add component's pin to a net
    aComponent.pinNet[aPin] = aNet;
    // not connected pins
    if (!aNet) {
        return;
    }
    // find net with this id
    var i, n;
    for (i = 0; i < this.item.length; i++) {
        if (this.item[i].id === aNet) {
            n = this.item[i];
        }
    }
    // if first pin in a net make a new net?
    if (!n) {
        n = new SC.Net(aNet);
        this.item.push(n);
    }
    // add pin to the net's pins
    n.pins.push({component: aComponent, pin: aPin});
};

