// Optimally render labels for components
"use strict";
// globals: document, window, CA

var SC = window.SC || {};

SC.renderLabel = SC.renderLabel || {};

SC.renderLabelUnits = {
    dc_voltage_supply: 'V'
};

SC.renderLabel.universal = function (aContext, aComponent) {
    // Render name and value
    var z = SC.v.zoom / SC.gridSize,
        e = aComponent,
        p = SC.v.canvasToScreen(aComponent.x, aComponent.y),
        r;
    aContext.globalAlpha = 1;
    // boxes for name and value
    r = SC.anchorBoxes(e);
    // no anchor, use universal anchor
    if (!r) {
        r = SC.anchorBoxes(e, SC.specsAnchor[aComponent.type] || SC.specsAnchor.universal);
    }
    aContext.font = Math.floor(9 * z) + 'px sans-serif';
    aContext.fillStyle = 'black';
    // name
    aContext.textAlign = r.a.textAlign;
    aContext.textBaseline = r.a.textBaseline;
    aContext.fillText(e.name, p.x + z * r.a.textX, p.y + r.a.textY * z);
    // value
    if (e.value !== undefined) {
        aContext.textAlign = r.b.textAlign;
        aContext.textBaseline = r.b.textBaseline;
        aContext.fillText(e.value + (SC.renderLabelUnits[aComponent.type] || ''), p.x + r.b.textX * z, p.y + r.b.textY * z);
    }
    /*
    console.log(r, aContext.font);
    aContext.strokeStyle = 'red';
    aContext.strokeRect(p.x + r.a.x * z, p.y + r.a.y * z, r.a.w * z, r.a.h * z);
    aContext.strokeStyle = 'blue';
    aContext.strokeRect(p.x + r.b.x * z, p.y + r.b.y * z, r.b.w * z, r.b.h * z);
    */
};

