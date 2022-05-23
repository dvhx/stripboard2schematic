// Net guide (extra point where the net should go)
"use strict";
// globals: document, window, CA, vec2

var SC = window.SC || {};

SC.Guide = function (aNet, aX, aY) {
    // Constructor
    this.net = aNet;
    this.x = aX || 0;
    this.y = aY || 0;
};

SC.Guide.prototype.toObject = function () {
    // Return exportable object
    return {
        net: this.net,
        x: this.x,
        y: this.y
    };
};

SC.Guide.prototype.fromObject = function (aObject) {
    // Set this from previously exported object
    this.net = aObject.net;
    this.x = aObject.x;
    this.y = aObject.y;
};

SC.Guide.prototype.render = function (aContext) {
    // Render Guide
    if (!SC.show.guides) {
        return;
    }
    var a = SC.v.canvasToScreen(this.x, this.y),
        size = 4 * SC.v.zoom / 20,
        s2 = size / 2;
    // dot
    aContext.globalAlpha = 1;
    aContext.fillStyle = '#00ff0099';
    aContext.fillRect(a.x - s2, a.y - s2, size, size);
    // net id
    if (SC.show.net_numbers) {
        aContext.fillStyle = 'green';
        aContext.textBaseline = 'middle';
        aContext.textAlign = 'left';
        aContext.font = '10px sans-serif';
        aContext.fillText(this.net, a.x + s2, a.y);
    }
    // selection
    if (this === SC.selected) {
        aContext.strokeStyle = 'red';
        aContext.strokeRect(a.x - s2, a.y - s2, size, size);
    }
};

