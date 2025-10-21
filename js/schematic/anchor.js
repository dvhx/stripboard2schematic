// Anchor is point inside components image that is transformed the same way component is rotated/mirrored, it is used for optimal label placement
"use strict";
// globals: document, window

var SC = window.SC || {};

SC.anchor = function (aComponent, aAnchorX, aAnchorY) {
    // Calculate rotated/mirrored coordinates inside aComponent image
    var img = aComponent.image(),
        w = img.width,
        h = img.height;
    function mirror(x) {
        if (aComponent.mirror) {
            return w - x;
        }
        return x;
    }

    switch (aComponent.rotate) {
    case null:
    case undefined:
    case 0:
        return {
            x: mirror(aAnchorX),
            y: aAnchorY
        };
    case 1:
        return {
            x: mirror(img.width - aAnchorY),
            y: aAnchorX
        };
    case 2:
        return {
            x: mirror(w - aAnchorX),
            y: h - aAnchorY
        };
    case 3:
        return {
            x: mirror(aAnchorY),
            y: h - aAnchorX
        };
    }
};

SC.anchorBox = function (aComponent, aX1, aY1, aX2, aY2) {
    // Calculate 2 rotated/mirrored coordinates inside aComponent image and return them sorted from left-top to right-bottom
    var a = SC.anchor(aComponent, aX1, aY1),
        b = SC.anchor(aComponent, aX2, aY2),
        r = {
            x: Math.min(a.x, b.x),
            y: Math.min(a.y, b.y),
            w: Math.abs(a.x - b.x),
            h: Math.abs(a.y - b.y)
        };
    r.x2 = r.x + r.w;
    r.y2 = r.y + r.h;
    return r;
};

SC.anchorBoxes = function (aComponent, aForceAnchors) {
    // Calculate 2 boxes and sort them left-top to right-bottom, so that name is
    // first and value second regardless of rotation and mirror
    var q = aForceAnchors || SC.specsAnchor[aComponent.type], a, b, c, img, w2, h2;
    if (!q) {
        return;
    }
    a = SC.anchorBox(aComponent, q.name.x1, q.name.y1, q.name.x2, q.name.y2);
    b = SC.anchorBox(aComponent, q.value.x1, q.value.y1, q.value.x2, q.value.y2);
    img = aComponent.image();
    w2 = img.width / 2;
    h2 = img.height / 2;
    if (a.y > b.y) {
        c = b;
        b = a;
        a = c;
    } else {
        if (a.x > b.x) {
            c = b;
            b = a;
            a = c;
        }
    }
    // find textAlign and textBaseline
    a.textAlign = 'left';
    a.textX = a.x;
    if (a.x < w2) {
        a.textAlign = 'right';
        a.textX += a.w;
    }
    b.textAlign = 'left';
    b.textX = b.x;
    if (b.x < w2) {
        b.textAlign = 'right';
        b.textX += b.w;
    }
    a.textBaseline = 'top';
    a.textY = a.y;
    if (a.y < h2) {
        a.textBaseline = 'alphabetic';
        a.textY += a.h;
    }
    b.textBaseline = 'top';
    b.textY = b.y;
    if (b.y < h2) {
        b.textBaseline = 'alphabetic';
        b.textY += b.h;
    }
    return {
        a: a,
        b: b
    };
};

