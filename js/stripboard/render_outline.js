// Render component outline
"use strict";
// globals: document, window

var SC = window.SC || {};

SC.renderOutline = function (aComponent, aContext, aColor) {
    // Render component outline
    // clear outline canvas
    var c = aContext, o = SC.show.components_opacity;
    c.globalCompositeOperation = 'source-over';
    // draw component 4 times, offset 5px left/right/upd/down
    c.translate(-5, 0);
    aComponent.render(c);
    c.translate(10, 0);
    aComponent.render(c);
    c.translate(-5, -5);
    aComponent.render(c);
    c.translate(0, 10);
    aComponent.render(c);
    c.translate(0, -5);
    // use what is drawn to preserve the desired color
    c.globalCompositeOperation = 'source-in';
    c.fillStyle = aColor;
    c.fillRect(0, 0, SC.layer.selected.width, SC.layer.selected.height);
    // erase the component itself so that we can see it, multiple because of transparency
    c.globalCompositeOperation = 'destination-out';
    SC.show.components_opacity = 1;
    aComponent.render(c);
    SC.show.components_opacity = o;
    c.globalCompositeOperation = 'source-over';
};
