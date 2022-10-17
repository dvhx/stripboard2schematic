// Trimmer pot directly on stripboard, not leads on the edge, use F to flip
"use strict";
// globals: document, window, CA, vec2

var SC = window.SC || {};

SC.Trimmer = function (aName, aX1, aY1, aX2, aY2, aInline) {
    this.type = 'trimmer';
    this.name = aName;
    this.x1 = aX1 || 0;
    this.y1 = aY1 || 0;
    this.x2 = aX2 || 0;
    this.y2 = aY2 || 0;
    this.value = '50k';
    this.inline = false;
};

SC.factory.trimmer = SC.Trimmer;
SC.namingPrefix.trimmer = 'P';

SC.Trimmer.prototype.toObject = function () {
    // Return exportable object
    return {
        type: this.type,
        name: this.name,
        x1: this.x1,
        y1: this.y1,
        x2: this.x2,
        y2: this.y2,
        value: this.value,
        inline: this.inline
    };
};

SC.Trimmer.prototype.fromObject = function (aObject) {
    // Set this from previously exported object
    this.type = aObject.type;
    this.name = aObject.name;
    this.x1 = aObject.x1;
    this.y1 = aObject.y1;
    this.x2 = aObject.x2;
    this.y2 = aObject.y2;
    this.value = aObject.value;
    this.inline = aObject.inline;
};

SC.Trimmer.prototype.validator = function () {
    // Return true if Trimmer spans exactly 3 holes
    return CA.distance(this.x1, this.y1, this.x2, this.y2) === 2;
};

SC.Trimmer.prototype.toNetlist = function () {
    // Return netlist object with correct pin order C-B-E
    return {
        type: 'potentiometer',
        name: this.name,
        value: this.value,
        nets: this.nets()
    };
};

SC.Trimmer.prototype.wiper = function () {
    // Return wiper coords
    var a = vec2(this.x1, this.y1),
        b = vec2(this.x2, this.y2),
        s = b.sub(a);
    if (this.inline) {
        return a.add(b).mul(0.5).round();
    }
    return a.add(s.mul(0.5)).add(s.right()).round();
};

SC.Trimmer.prototype.center = function () {
    // Return center coords
    var a = vec2(this.x1, this.y1),
        b = vec2(this.x2, this.y2),
        s = b.sub(a);
    if (this.inline) {
        return a.add(b).mul(0.5).round();
    }
    return a.add(s.mul(0.5)).add(s.right().mul(0.5));
};

SC.Trimmer.prototype.nets = function () {
    // Return nets connected to pins
    var w = this.wiper();
    return [
        SC.grid.net(this.x1, this.y1),
        SC.grid.net(w.x, w.y),
        SC.grid.net(this.x2, this.y2)
    ];
};

SC.Trimmer.prototype.flip = function () {
    // Flip pins (polarity)
    [this.x1, this.y1, this.x2, this.y2] = [this.x2, this.y2, this.x1, this.y1];
};

SC.Trimmer.prototype.hasPin = function (aX, aY) {
    // Return true if given coords are at any of the pins
    var w = this.wiper();
    return (this.x1 === aX && this.y1 === aY)
        || (this.x2 === aX && this.y2 === aY)
        || (w.x === aX && w.y === aY);
};

SC.Trimmer.prototype.distanceTo = function (aX, aY) {
    // Return distance to given point on grid
    var w = this.wiper();
    return Math.min(
        CA.distancePointLineSegment(aX, aY, this.x1, this.y1, this.x2, this.y2),
        CA.distancePointLineSegment(aX, aY, this.x1, this.y1, w.x, w.y),
        CA.distancePointLineSegment(aX, aY, this.x2, this.y2, w.x, w.y)
    );
};

SC.Trimmer.prototype.render = function (aContext) {
    // Render component
    var a = SC.grid.gridToScreen(this.x1, this.y1),
        b = SC.grid.gridToScreen(this.x2, this.y2),
        c = this.center(),
        w = this.wiper();
    c = SC.grid.gridToScreen(c.x, c.y);
    w = SC.grid.gridToScreen(w.x, w.y);
    // check length
    if (CA.distance(this.x1, this.y1, this.x2, this.y2) % 2 !== 0) {
        aContext.strokeStyle = 'black';
        aContext.fillStyle = 'blue';
        aContext.font = 'bold 12px sans-serif';
        aContext.textBaseline = 'middle';
        aContext.textAlign = 'center';
        aContext.fillText('Trimmer must span exactly 3 holes', c.x, c.y);
        aContext.beginPath();
        aContext.moveTo(a.x, a.y);
        aContext.lineTo(b.x, b.y);
        aContext.stroke();
        return;
    }
    // package
    if (this.inline) {
        SC.renderDefault(aContext, this.x1, this.y1, this.x2, this.y2, SC.image.trimmer_inline, '', '', 43, 42);
    } else {
        SC.renderDefault(aContext, this.x1, this.y1, this.x2, this.y2, SC.image.trimmer, '', '', 30, 22);
    }
    // name + value
    aContext.globalAlpha = 1;
    aContext.strokeStyle = 'black';
    aContext.lineWidth = 2;
    aContext.font = 'bold 12px sans-serif';
    aContext.textBaseline = 'bottom';
    aContext.textAlign = 'center';
    aContext.fillStyle = 'white';
    aContext.strokeText(this.name, c.x, c.y - 2 * SC.v.zoom);
    aContext.fillText(this.name, c.x, c.y - 2 * SC.v.zoom);
    aContext.textBaseline = 'top';
    aContext.strokeText(this.value, c.x, c.y + 2 * SC.v.zoom);
    aContext.fillText(this.value, c.x, c.y + 2 * SC.v.zoom);
};

SC.Trimmer.prototype.propertiesDialog = function (aCallback) {
    // Show properties dialog
    var t = this, a, d = SC.propertiesDialog(this, 'Ω', function (aButton) {
        if (aButton === 'Save') {
            t.inline = a.input.checked;
        }
        aCallback(aButton);
    });
    a = CA.labelCheckboxLabel(d.dlg.content, 'Inline', this.inline, '(multiturn standing trimmer)');
    a.div.title = 'Inline means standing multiturn pot with pins in straight line';
};

