// Default component rendering (rotated image with extra leads)
"use strict";
// globals: document, window, vec2, CA

var SC = window.SC || {};

SC.renderDefault = function (aContext, aX1, aY1, aX2, aY2, aImage, aName, aValue, aPinX, aPinY) {
    // Render component
    var a = vec2(aX1, aY1),
        b = vec2(aX2, aY2),
        a2 = a.clone(),
        b2 = b.clone(),
        s = b.sub(a).unit(),
        angle,
        c = a.add(b).mul(0.5),
        length,
        length_between_pins;
    if (a2.distanceTo(b2) > 2) {
        a2 = c.add(s.mul(-1));
        b2 = c.add(s.mul(1));
    }
    // screen coords
    a = SC.grid.gridToScreen(a.x, a.y);
    a2 = SC.grid.gridToScreen(a2.x, a2.y);
    b = SC.grid.gridToScreen(b.x, b.y);
    b2 = SC.grid.gridToScreen(b2.x, b2.y);
    c = SC.grid.gridToScreen(c.x, c.y);
    length = CA.distance(a2.x, a2.y, b2.x, b2.y);
    angle = b.sub(a).angle(true) - Math.PI / 2,
    //console.log(aName, {a, b, c, a2, b2, length, angle});
    // image
    aContext.globalAlpha = SC.show.components_opacity;
    length_between_pins = aImage.height - 2 * aPinY;
    aContext.ca_canvas.drawImageRotated(
        aImage,
        a2.x,
        a2.y,
        length * aImage.width / length_between_pins,
        length * aImage.height / length_between_pins,
        angle,
        aPinX,
        aPinY
    );
    // dots
    aContext.fillStyle = '#0000ff';
    aContext.beginPath();
    aContext.arc(a.x, a.y, 4 * SC.v.zoom, 0, 2 * Math.PI, false);
    aContext.closePath();
    aContext.arc(b.x, b.y, 4 * SC.v.zoom, 0, 2 * Math.PI, false);
    aContext.fill();
    // extra leads
    aContext.lineWidth = 4 * SC.v.zoom;
    aContext.strokeStyle = '#000000';
    aContext.beginPath();
    aContext.moveTo(a.x, a.y);
    aContext.lineTo(a2.x, a2.y);
    aContext.stroke();
    aContext.beginPath();
    aContext.moveTo(b.x, b.y);
    aContext.lineTo(b2.x, b2.y);
    aContext.stroke();
    // name + value
    aContext.globalAlpha = 1;
    aContext.font = 'bold 12px sans-serif';
    aContext.textBaseline = 'bottom';
    aContext.textAlign = 'center';
    aContext.strokeStyle = 'black';
    aContext.lineWidth = 2;
    aContext.fillStyle = 'white';
    aContext.strokeText(aName, c.x, c.y);
    aContext.fillText(aName, c.x, c.y);
    aContext.textBaseline = 'top';
    aContext.strokeText(aValue, c.x, c.y);
    aContext.fillText(aValue, c.x, c.y);
};

