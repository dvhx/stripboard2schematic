// Stripboard holes grid
"use strict";
// globals: document, window, CA, vec2

var SC = window.SC || {};

SC.Grid = function (aX1, aY1, aX2, aY2, aWidth, aHeight) {
    // Constructor
    this.x1 = aX1;
    this.y1 = aY1;
    this.x2 = aX2;
    this.y2 = aY2;
    this.width = aWidth;
    this.height = aHeight;
    this.image = new Image();
    this.image.onload = SC.render;
    this.copper = [];
    this.updateNets();
};

SC.Grid.prototype.toObject = function () {
    // Return exportable object
    return {
        x1: this.x1,
        y1: this.y1,
        x2: this.x2,
        y2: this.y2,
        width: this.width,
        height: this.height,
        image: this.image && this.image.src,
        copper: this.copper
    };
};

SC.Grid.prototype.fromObject = function (aObject) {
    // Set this from previously exported object
    this.copper = [[0]];
    this.x1 = aObject.x1;
    this.y1 = aObject.y1;
    this.x2 = aObject.x2;
    this.y2 = aObject.y2;
    this.width = aObject.width;
    this.height = aObject.height;
    if (aObject.image) {
        if (typeof aObject.image === 'string') {
            this.image.src = aObject.image || SC.emptyImage;
        } else {
            this.image.src = aObject.image.src || SC.emptyImage;
        }
    }
    this.copper = aObject.copper || this.copper;
    if (this.copper.length !== this.height || this.copper[0].length !== this.width) {
        this.copper = CA.array2d(this.width, this.height, function (x, y) { CA.unused(x); return y + 1; });
    }
};

SC.Grid.prototype.onBoard = function (aX, aY) {
    // Return true if coordinate is on board
    return aX >= 0 && aY >= 0 && aX < this.width && aY < SC.grid.height;
};

SC.Grid.prototype.net = function (aX, aY) {
    // Get net at given coordinates
    if (this.onBoard(aX, aY)) {
        return this.copper[aY][aX];
    }
    return 0;
};

SC.Grid.prototype.canvasToGrid = function (aX, aY, aInsideOnly) {
    // Return nearest grid coordinate for given absolute canvas coordinate
    var x = Math.round((aX - this.x1) / (this.x2 - this.x1) * (this.width - 1)),
        y = Math.round((aY - this.y1) / (this.y2 - this.y1) * (this.height - 1));
    if (aInsideOnly) {
        return {
            x: Math.min(this.width - 1, Math.max(0, x)),
            y: Math.min(this.height - 1, Math.max(0, y))
        };
    }
    return vec2(x, y);
};

SC.Grid.prototype.canvasToGridFloat = function (aX, aY) {
    // Return nearest grid coordinate for given absolute canvas coordinate
    var x = (aX - this.x1) / (this.x2 - this.x1) * (this.width - 1),
        y = (aY - this.y1) / (this.y2 - this.y1) * (this.height - 1);
    return vec2(x, y);
};

SC.Grid.prototype.gridToCanvas = function (aX, aY) {
    // Return canvas coordinates for given grid coordinate
    var x = this.x1 + aX * (this.x2 - this.x1) / (this.width - 1),
        y = this.y1 + aY * (this.y2 - this.y1) / (this.height - 1);
    return vec2(
        x,
        y
    );
};

SC.Grid.prototype.gridToScreen = function (aX, aY, aRound) {
    // Return screen coordinates for given grid coordinate
    var p = this.gridToCanvas(aX, aY),
        s = SC.v.canvasToScreen(p.x, p.y);
    return vec2(
        aRound ? Math.round(s.x) : s.x,
        aRound ? Math.round(s.y) : s.y
    );
};

SC.Grid.prototype.renderDots = function (aContext, aX1, aY1, aX2, aY2) {
    // Render only dots, used during define_grid tool
    var a = {x: aX1, y: aY1},
        b = {x: aX2, y: aY2},
        x,
        y;
    aContext.globalCompositeOperation = 'source-over';
    aContext.globalAlpha = 1;
    aContext.fillStyle = 'lime';
    for (y = 0; y < this.height; y++) {
        for (x = 0; x < this.width; x++) {
            aContext.fillRect(
                a.x + (b.x - a.x) * x / (this.width - 1) - 2,
                a.y + (b.y - a.y) * y / (this.height - 1) - 2,
                4,
                4
            );
        }
    }
};

SC.Grid.prototype.render = function (aContext) {
    // Render grid
    var a = SC.v.canvasToScreen(this.x1, this.y1),
        b = SC.v.canvasToScreen(this.x2, this.y2),
        x,
        y,
        rx,
        ry,
        cw = (b.x - a.x) / (this.width - 1),
        ch = (b.y - a.y) / (this.height - 1),
        cut_size = Math.min(cw, ch);
    // render background image
    if (SC.show.background && this.image && this.image.width) {
        aContext.globalAlpha = 1;
        aContext.drawImage(
            this.image,
            SC.v.x,
            SC.v.y,
            this.image.width * SC.v.zoom,
            this.image.height * SC.v.zoom
        );
    }
    // copper
    if (SC.show.copper) {
        SC.layer.copper.clear();
        SC.layer.copper.context.globalAlpha = 1;
        for (y = 0; y < this.height; y++) {
            for (x = 0; x < this.width; x++) {
                rx = a.x + (b.x - a.x) * x / (this.width - 1);
                ry = a.y + (b.y - a.y) * y / (this.height - 1);
                // copper
                SC.layer.copper.context.fillStyle = '#ff7700ff';
                SC.layer.copper.context.globalCompositeOperation = 'source-over';
                SC.layer.copper.context.fillRect(
                    rx - cw / 2,
                    ry - ch / 2 + ch * 0.05 / 2,
                    cw,
                    0.95 * ch
                );
                // cut
                SC.layer.copper.context.globalCompositeOperation = 'destination-out';
                SC.layer.copper.context.beginPath();
                SC.layer.copper.context.arc(
                    rx,
                    ry,
                    this.copper[y][x] ? 0.1 * cut_size : 0.52 * cut_size,
                    0,
                    2 * Math.PI,
                    false
                );
                SC.layer.copper.context.fill();
            }
        }
    }
    aContext.globalCompositeOperation = 'source-over';
    aContext.globalAlpha = 1;
    // text
    aContext.textAlign = 'center';
    aContext.textBaseline = 'middle';
    aContext.strokeStyle = 'black';
    aContext.fillStyle = 'lime';
    if (SC.show.net_numbers && (this.x1 !== this.x2 || this.y1 !== this.y2)) {
        for (y = 0; y < this.height; y++) {
            for (x = 0; x < this.width; x++) {
                rx = a.x + (b.x - a.x) * x / (this.width - 1);
                ry = a.y + (b.y - a.y) * y / (this.height - 1);
                aContext.strokeText(this.copper[y][x], rx, ry);
                aContext.fillText(this.copper[y][x], rx, ry);
            }
        }
    }
};

SC.Grid.prototype.updateNets = function () {
    // Make sure copper is correct size and set correct net number
    var t = this, n = 0, x, y, i, nets = [];
    if (this.copper.length !== this.height || this.copper[0].length !== this.width) {
        this.copper = CA.array2d(this.width, this.height, function (x, y) { CA.unused(x); return y + 1; });
    }
    // assign numbers
    for (y = 0; y < this.height; y++) {
        for (x = 0; x < this.width; x++) {
            if (x === 0 || this.copper[y][x] === 0) {
                n++;
            }
            this.copper[y][x] = this.copper[y][x] ? n : 0;
        }
    }
    //console.log('---');
    function replace(aOld, aNew) {
        // replace one net number with other
        var u, v;
        for (u = 0; u < t.height; u++) {
            for (v = 0; v < t.width; v++) {
                if (t.copper[u][v] === aOld) {
                    t.copper[u][v] = aNew;
                }
            }
        }
    }
    // find all links
    if (SC.components && (this.copper.length > 1)) {
        for (i = 0; i < SC.components.item.length; i++) {
            if (SC.components.item[i] instanceof SC.Link) {
                nets = SC.components.item[i].nets();
                replace(nets[0], nets[1]);
            }
        }
    }
};

SC.Grid.prototype.cut = function (aX, aY) {
    // Add/remove cut to copper
    var q = this.width * this.height + 1;
    if (aX < 0 || aY < 0 || aY > this.copper.length - 1 || aX > this.copper[0].length - 1) {
        return;
    }
    if (this.copper[aY][aX] === 0) {
        // merge nets
        this.copper[aY][aX] = this.copper[aY][aX - 1] || this.copper[aY][aX + 1];
        if (!this.copper[aY][aX]) {
            q++;
            this.copper[aY][aX] = q;
        }
        //console.log('add', aY, aX);
    } else {
        // cut
        this.copper[aY][aX] = 0;
        //console.log('cut', aY, aX);
    }
    this.updateNets();
};

SC.Grid.prototype.dialog = function (aCallback) {
    // Show dialog where user sets number of holes in grid
    var t = this, dlg = CA.modalDialog('Define grid size', null, ['Save', 'Cancel'], function (aButton) {
        console.log(aButton);
        if (aButton === 'Save') {
            t.width = parseInt(dlg.horizontally.input.value, 10);
            t.height = parseInt(dlg.vertically.input.value, 10);
            t.updateNets();
            SC.render();
        }
        if (aCallback) {
            aCallback(aButton);
        }
    });
    dlg.horizontally = CA.labelInput(dlg.content, 'Horizontally', 'number', 'holes');
    dlg.horizontally.input.value = this.width;
    dlg.horizontally.input.focus();
    dlg.horizontally.input.select();
    dlg.vertically = CA.labelInput(dlg.content, 'Vertically', 'number', 'holes');
    dlg.vertically.input.value = this.height;
    CA.labelLabel(CA.modalVisible.content, '', 'Note: Resizing existing grid removes any existing cuts!')
    return dlg;
};

SC.Grid.prototype.expand = function () {
    // Add one strip to the bottom, preserves cuts
    this.copper.push((new Array(this.width)).fill(this.height + 2));
    this.y2 += (this.y2 - this.y1) / (this.height - 1);
    this.height++;
    this.updateNets();
};

