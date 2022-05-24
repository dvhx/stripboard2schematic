// Single universal component (unlike stripboard where every component behaves slightly differently, in schematic component is just image with pins)
"use strict";
// globals: document, window, CA, vec2

var SC = window.SC || {};

SC.Component = function (aType, aName, aValue, aX, aY, aRotate, aMirror) {
    // Constructor
    this.type = aType || 'resistor';
    this.name = aName;
    this.value = aValue;
    this.x = aX || 0;
    this.y = aY || 0;
    this.rotate = aRotate || 0;
    this.mirror = aMirror || false;
    this.pinNet = [];
    this.updatePins();
};

SC.Component.prototype.toObject = function () {
    // Return exportable object
    return {
        type: this.type,
        name: this.name,
        value: this.value,
        x: this.x,
        y: this.y,
        rotate: this.rotate,
        mirror: this.mirror,
        pinNet: this.pinNet
    };
};

SC.Component.prototype.fromObject = function (aObject) {
    // Set this from previously exported object
    this.type = aObject.type;
    this.name = aObject.name;
    this.value = aObject.value;
    this.x = aObject.x;
    this.y = aObject.y;
    this.rotate = aObject.rotate;
    this.mirror = aObject.mirror;
    this.pinNet = aObject.pinNet || [];
    this.updatePins();
};

SC.Component.prototype.updatePins = function () {
    // Update pins after rotation or mirror
    var i, p = SC.specsPin[this.type], t,
        img = this.image();
    this.pin = [];
    for (i = 0; i < p.length; i++) {
        t = SC.rotateAndMirror(
            this.rotate,
            this.mirror,
            p[i].x,
            p[i].y,
            img.width,
            img.height
        );
        this.pin.push({
            x: t.x,
            y: t.y,
            component: this,
            pin: p[i].name,
            index: i
        });
    }
};

SC.Component.prototype.pinXY = function (aPinIndex, aScreen) {
    // Get grid coordinates of given pin
    if (!this.pin[aPinIndex]) {
        console.warn('Component ' + this.type + ' ' + this.name + ' has no pin ' + aPinIndex);
    }
    var x = this.x + this.pin[aPinIndex].x,
        y = this.y + this.pin[aPinIndex].y,
        s;
    if (aScreen) {
        s = SC.v.canvasToScreen(x, y);
        return {x: s.x, y: s.y};
    }
    return {x: x, y: y};
};

SC.Component.prototype.pinByName = function (aPinName) {
    // Get pin index of a pin by pin's name, e.g. 'E' of transistor_npn
    var i;
    for (i = 0; i < this.pin.length; i++) {
        if (this.pin[i].pin === aPinName) {
            return this.pin[i].index;
        }
    }
};

SC.Component.prototype.image = function () {
    // Return correctly rotated and mirrored image of this component
    var t = this.type;
    if (this.type === 'capacitor' && this.value.indexOf('u') >= 0) {
        t = 'capacitor_pol';
    }
    if (!SC.image[t]) {
        console.warn('Image not found: ' + t);
    }
    return SC.image[t][this.rotate + (this.mirror ? 10 : 0)];
};

SC.Component.prototype.render = function (aContext) {
    // Render component
    var a = SC.v.canvasToScreen(this.x, this.y),
        i,
        p,
        img = this.image();
    this.width = img.width / SC.gridSize;
    this.height = img.height / SC.gridSize;
    // image
    aContext.globalAlpha = 1;
    aContext.drawImage(img, a.x, a.y, this.width * SC.v.zoom, this.height * SC.v.zoom);
    // pins
    if (SC.show.net_numbers) {
        aContext.fillStyle = 'green';
        aContext.textBaseline = 'middle';
        aContext.textAlign = 'left';
        aContext.font = '10px sans-serif';
        for (i = 0; i < this.pin.length; i++) {
            p = this.pinXY(i, true);
            aContext.fillRect(p.x - 2, p.y - 2, 4, 4);
            aContext.fillText(this.pin[i].pin + ' p' + this.pin[i].index, p.x + 4, p.y);
        }
    }
    // selection
    if (SC.show.selection && this === SC.selected) {
        aContext.strokeStyle = 'red';
        aContext.strokeRect(a.x, a.y, this.width * SC.v.zoom, this.height * SC.v.zoom);
    }
    aContext.fillStyle = 'black';
    // name/value
    if (SC.renderLabel[this.type]) {
        SC.renderLabel[this.type](aContext, this);
    } else {
        SC.renderLabel.universal(aContext, this);
    }
};

SC.Component.prototype.center = function () {
    // Get center point of component in grid coordinates
    var img = this.image();
    return {
        x: this.x + img.width / 2 / SC.gridSize,
        y: this.y + img.height / 2 / SC.gridSize
    };
};

SC.Component.prototype.restoreFromComponents = function (aOldComponents) {
    // Restore position, mirror and flip from old components (after netlist reimport from stripboard)
    var i;
    if (aOldComponents && aOldComponents.item) {
        for (i = 0; i < aOldComponents.item.length; i++) {
            if (this.name === aOldComponents.item[i].name) {
                this.x = aOldComponents.item[i].x;
                this.y = aOldComponents.item[i].y;
                this.rotate = aOldComponents.item[i].rotate;
                this.mirror = aOldComponents.item[i].mirror;
                this.updatePins();
                return true;
            }
        }
    }
};

