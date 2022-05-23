// Single net (connections between multiple components sharing the same netlist number)
"use strict";
// globals: document, window, CA, vec2

var SC = window.SC || {};

SC.Net = function (aId) {
    // Constructor
    this.id = aId;
    this.pins = []; // {component: SC.Component, pin: 0}
};

SC.Net.prototype.toObject = function () {
    // Return exportable object
    var i, a = [];
    for (i = 0; i < this.pins.length; i++) {
        a.push({
            component: this.pins[i].component.name,
            pin: this.pins[i].pin
        });
    }
    return {
        id: this.id,
        pins: a
    };
};

SC.Net.prototype.fromObject = function (aObject) {
    // Set this from previously exported object
    this.id = aObject.id;
    this.pins = [];
    var i;
    for (i = 0; i < aObject.pins.length; i++) {
        this.pins.push({
            component: SC.components.findByName(aObject.pins[i].component),
            pin: aObject.pins[i].pin
        });
    }
};

SC.Net.prototype.drawDotsWhere3Intersects = function (aContext, aSeg, aPinPoints) { //, aWhichNet
    // Draw dot where 3 or more segments meet
    //console.log(aSeg, aPinPoints, aWhichNet);
    var size = 4 * SC.v.zoom / SC.gridSize,
        i,
        p,
        k,
        ends = {};
    for (i = 0; i < aSeg.length; i++) {
        // start
        k = aSeg[i].x1 + '_' + aSeg[i].y1;
        ends[k] = ends[k] || {
            count: 0,
            x: aSeg[i].x1,
            y: aSeg[i].y1,
            debug: 'start'
        };
        ends[k].count++;
        // end
        k = aSeg[i].x2 + '_' + aSeg[i].y2;
        ends[k] = ends[k] || {
            count: 0,
            x: aSeg[i].x2,
            y: aSeg[i].y2,
            debug: 'end'
        };
        ends[k].count++;
    }
    // add pin points (so that resistor attaching to 2 segments will cause ball)
    for (i = 0; i < aPinPoints.length; i++) {
        p = {
            x: aPinPoints[i].x,
            y: aPinPoints[i].y
        };
        k = p.x + '_' + p.y;
        ends[k] = ends[k] || {
            count: 0,
            x: p.x,
            y: p.y,
            debug: 'pin'
        };
        ends[k].count++;
    }
    // ball at >=3 intersections
    if (aContext) {
        aContext.globalAlpha = 1;
        aContext.fillStyle = 'black';
        for (k in ends) {
            if (ends.hasOwnProperty(k)) {
                if (ends[k].count >= 3) {
                    p = SC.v.canvasToScreen(ends[k].x, ends[k].y);
                    aContext.beginPath();
                    aContext.arc(p.x, p.y, size, 0, 2 * Math.PI, false);
                    aContext.fill();
                }
            }
        }
    }
    /*
    if (aWhichNet === 4) {
        console.log(ends, aSeg, aPinPoints);
    }
    */
};

SC.Net.prototype.render = function (aContext) {
    // Render this net
    var i, s, a, b, pt = [],
        kr, cpins = [],
        lw = 2 * SC.v.zoom / SC.gridSize;
    // find all component pins
    for (i = 0; i < this.pins.length; i++) {
        s = this.pins[i].component.pinXY(this.pins[i].pin, false);
        pt.push(s);
        cpins.push(s);
    }
    // include guides
    SC.guides.addToPoints(this.id, pt);
    // find minimum spanning tree
    kr = window.kruskalCoords(pt);
    this.kruskal = kr;
    // draw segments
    this.color = SC.palette[this.id % SC.palette.length];
    aContext.font = '10px sans-serif';
    aContext.globalAlpha = 1;
    aContext.lineWidth = lw;
    aContext.strokeStyle = SC.show.net_black ? 'black' : this.color;
    aContext.fillStyle = SC.show.net_black ? 'black' : this.color;
    for (i = 0; i < kr.length; i++) {
        a = SC.v.canvasToScreen(kr[i].x1, kr[i].y1);
        b = SC.v.canvasToScreen(kr[i].x2, kr[i].y2);
        aContext.beginPath();
        aContext.moveTo(a.x, a.y);
        aContext.lineTo(b.x, b.y);
        aContext.stroke();
        //if (SC.show.net_numbers) {
        //aContext.fillText('n' + this.id, (a.x + b.x) / 2 + 4, (a.y + b.y) / 2);
        //}
    }
    // draw dots in intersections
    this.drawDotsWhere3Intersects(aContext, kr, cpins, this.id);
};

SC.Net.prototype.distanceTo = function (aX, aY) {
    // Return nearest distance of point to any kruskal segment of this net
    var d, m = Number.MAX_VALUE,
        i, k;
    for (i = 0; i < this.kruskal.length; i++) {
        k = this.kruskal[i];
        d = CA.distancePointLineSegment(aX, aY, k.x1, k.y1, k.x2, k.y2);
        m = Math.min(d, m);
    }
    return m;
};



