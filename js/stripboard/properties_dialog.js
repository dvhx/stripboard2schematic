// Standard properties dialog for name and value, covers 90% of cases
"use strict";
// globals: document, window, CA

var SC = window.SC || {};

SC.propertiesDialog = function (aComponent, aUnits, aCallback, aValidator) {
    // Standard properties dialog for name and value
    var dlg, name, value;

    dlg = CA.modalDialog(aComponent.type, '', ['Save', 'Cancel'], function (aButton) {
        if (aButton === 'Save') {
            if (aComponent.hasOwnProperty('value')) {
                aComponent.value = value.input.value;
            }
            if (aComponent.hasOwnProperty('name')) {
                aComponent.name = name.input.value;
            }
        }
        SC.render();
        if (aCallback) {
            return aCallback(aButton, aComponent);
        }
    });

    // value
    if (aComponent.hasOwnProperty('value')) {
        value = CA.labelInput(dlg.content, 'Value', 'text', aUnits);
        value.input.value = aComponent.value;
        value.input.focus();
        value.input.select();
    }

    // name
    if (aComponent.hasOwnProperty('name')) {
        name = CA.labelInput(dlg.content, 'Name', 'text', ' ');
        name.input.value = aComponent.name;
        if (!value) {
            name.input.focus();
            name.input.select();
        }
    }

    // show it near top not center
    dlg.div.style.position = 'fixed';
    dlg.div.style.top = '1cm';

    return {
        dlg: dlg,
        value: value,
        name: name
    };
};

