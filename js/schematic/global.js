// Global variables
"use strict";
// globals: document, window, CA

var SC = window.SC || {};

SC.show = {
    selection: true,
    net_numbers: false,
    net_crossings: true,
    guides: true,
    net_black: false
};

SC.gridSize = 20; // grid size used in component images, e.g. resistor is 40x60 (2x3 grid size, pins are at [1,0] and [1,3])

SC.tool = 'select'; // Current tool

SC.filename = 'noname.schematic'; // Current filename

SC.autosave = true; // Save on page reload/quit

SC.grayComponents = false; // If true components will have gray background (easier debugging)

SC.clearStorageAfterImport = !false; // If true erase stored netlist after successful import

SC.image = {};  // Image cache

