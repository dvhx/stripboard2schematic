// Adding new component
"use strict";
// globals: document, window, CA

var SC = window.SC || {};

SC.add = function (aComponent) {
    // Show properties dialog on just added component, remove it if user chooses cancel
    // Some components have validator function that return false if component is not allowed (usually wrong span)
    if (aComponent.validator && !aComponent.validator()) {
        SC.components.remove(aComponent);
        SC.grid.updateNets();
        SC.render();
        return;
    }
    // Show properties dialog just after adding
    var p = aComponent.propertiesDialog(function (aButton) {
        if (!aButton || aButton === 'Cancel') {
            // remove
            SC.components.remove(aComponent);
            SC.selected = null;
        } else {
            // add
            SC.components.item.push(aComponent);
            SC.selected = aComponent;
        }
        // re-render
        SC.layer.selected.clear();
        SC.grid.updateNets();
        SC.render();
    });
    // rename "Save" to "Add"
    if (p && p.dlg && p.dlg.buttons && p.dlg.buttons.Save) {
        p.dlg.buttons.Save.textContent = 'Add';
    }
    return p;
};


