// Global variables
"use strict";
// globals: document, window, CA

var SC = window.SC || {};

// Which layers to show and opacity
SC.show = {
    background: true,
    components: true,
    components_opacity: 0.5,
    copper: true,
    copper_opacity: 0.5,
    net_numbers: false,
    selection: true
};

SC.tool = 'resistor'; // Current tool

SC.filename = 'noname.stripboard'; // Current filename

SC.factory = {}; // Constructors for different elements, used to restore components

SC.autosave = true; // Save on page reload/quit

// Image to show when no bg image is set
SC.emptyImage = 'data:image/gif;base64,R0lGODlhAQABAHAAACH5BAUAAAAALAAAAAABAAEAAAICRAEAOw==';

// Location of schematic.html (should be on the same domain for import to work seamlesly)
SC.netlist2SchematicUrl = 'schematic.html';

// Naming prefixes (R for resistor, C for capacitor) to which number will be added, e.g. R1, R2, C1
SC.namingPrefix = {};

