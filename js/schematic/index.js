// Main
"use strict";
// globals: document, window, CA, vec2

var SC = window.SC || {};

SC.purge = function () {
    // Clear all and reload
    SC.autosave = false;
    CA.storage.removeAll();
    document.location.reload();
};

SC.frames = 0;
SC.render = function (aWhiteBg) {
    // Main rendering function
    CA.perf.begin('render');
    SC.frames++;
    SC.layer.component.clear(aWhiteBg ? 'white' : undefined);
    SC.layer.control.clear();
    SC.components.render(SC.layer.component.context);
    SC.nets.render(SC.layer.component.context);
    SC.guides.render(SC.layer.component.context);
    CA.perf.end('render');
};

SC.onClear = function () {
    // Clear all components
    if (confirm('Clear all components?')) {
        SC.filename = 'noname.schematic';
        SC.components.item = [];
        SC.nets.item = [];
        SC.guides.item = [];
        SC.render();
    }
};

SC.onClearGuides = function () {
    // Clear all guides
    SC.undo.push();
    SC.guides.item = [];
    SC.render();
};

SC.onExport = function () {
    // Export all data
    var s = prompt('Export as', SC.filename.split('.')[0]), o;
    if (s) {
        if (!s.match('.schematic')) {
            s += '.schematic';
        }
        o = {
            format: 'schematic-0.1',
            filename: s,
            viewport: SC.v.toObject(),
            components: SC.components.toObject(),
            nets: SC.nets.toObject(),
            guides: SC.guides.toObject()
        };
        CA.download(JSON.stringify(o, undefined, 1), s);
        SC.filename = s;
    }
};

SC.onImport = function () {
    // Import schematic file
    CA.chooseFiles(function (aFiles) {
        var o = JSON.parse(aFiles[0].data);
        SC.filename = o.filename;
        SC.v.fromObject(o.viewport);
        SC.components.fromObject(o.components);
        SC.nets.fromObject(o.nets);
        SC.guides.fromObject(o.guides || {item: []});
        SC.render();
    }, '.schematic', true);
};

SC.onImportPlacement = function () {
    // Import placement from other schematic file
    CA.chooseFiles(function (aFiles) {
        var o = JSON.parse(aFiles[0].data);
        console.log(o);
        SC.copyPlacement(o);
        /*
        SC.filename = o.filename;
        SC.v.fromObject(o.viewport);
        SC.components.fromObject(o.components);
        SC.nets.fromObject(o.nets);
        SC.guides.fromObject(o.guides || {item: []});
        SC.render();
        */
    }, '.schematic', true);
};



SC.onSave = function () {
    // Save current scene to local storage
    CA.storage.writeString('SCHEMATIC.tool', SC.tool);
    CA.storage.writeString('SCHEMATIC.filename', SC.filename);
    CA.storage.writeObject('SCHEMATIC.v', SC.v.toObject());
    CA.storage.writeObject('SCHEMATIC.components', SC.components.toObject());
    CA.storage.writeObject('SCHEMATIC.nets', SC.nets.toObject());
    CA.storage.writeObject('SCHEMATIC.guides', SC.guides.toObject());
    CA.storage.writeObject('SCHEMATIC.show', SC.show);
};

SC.checkUrlProject = function (aCallback) {
    // Check url for project=something, load it from project dir
    var p = CA.urlParams()['project'];
    console.log('project', p);
    if (!p) {
        aCallback();
        return;
    }
    if (!p.match(/^[a-z0-9_]+$/)) {
        alert('Invalid project name: ' + p);
        aCallback();
        return;
    }
    console.log('loading project', p);
    CA.ajax('project/' + encodeURIComponent(p) + '.schematic', {cache: Date.now()}, function (aOk, aData) {
        if (!aOk) {
            alert('Project "' + p + '" not found!');
            aCallback();
            return;
        }
        SC.lastData = aData;
        var o = JSON.parse(aData);
        SC.filename = o.filename;
        SC.v.fromObject(o.viewport);
        SC.components.fromObject(o.components);
        SC.nets.fromObject(o.nets);
        SC.guides.fromObject(o.guides || {item: []});
        //SC.render();
        // save it and remove the parameter so that user can make changes without it being overwritten on each refresh
        SC.show.net_numbers = false;
        SC.onSave();
        document.location = 'schematic.html';
    }, 'GET');
};

SC.onLoad = function () {
    // Load scene from local storage
    SC.filename = CA.storage.readString('SCHEMATIC.filename', SC.filename);
    SC.show = CA.storage.readObject('SCHEMATIC.show', SC.show);
    SC.v.fromObject(CA.storage.readObject('SCHEMATIC.v', SC.v.toObject()));
    SC.components.fromObject(CA.storage.readObject('SCHEMATIC.components', {item: []}));
    SC.nets.fromObject(CA.storage.readObject('SCHEMATIC.nets', {item: []}));
    SC.guides.fromObject(CA.storage.readObject('SCHEMATIC.guides', {item: []}));
    SC.tool = CA.storage.readString('SCHEMATIC.tool', SC.tool);
    // show checkboxes
    SC.e.show_selection.checked = SC.show.selection;
    SC.e.show_net_numbers.checked = SC.show.net_numbers;
    SC.e.show_net_crossings.checked = SC.show.net_crossings;
    SC.e.show_guides.checked = SC.show.guides;
    SC.e.show_net_black.checked = SC.show.net_black;
    SC.onTool({target: {id: 'tool_' + SC.tool}});
    SC.checkUrlProject(SC.render);
};

SC.onShow = function (event) {
    // Click on show checkbox
    SC.show[event.target.id.replace('show_', '')] = event.target.checked;
    SC.nearest = null;
    SC.selected = null;
    SC.render();
};

SC.onScreenshot = function (event) {
    // Download screenshot
    var o = JSON.parse(JSON.stringify(SC.show)), c;
    SC.show.net_crossings = false;
    SC.show.selection = false;
    SC.show.net_numbers = false;
    SC.show.guides = false;
    SC.show.net_black = true;
    if (!event.shiftKey) {
        SC.v.zoom = 20;
        c = SC.components.center();
        SC.v.centerTo(c.x, c.y);
    }
    SC.render(true);
    SC.layer.component.download(SC.filename.replace('.schematic', '') + '_schematic.png');
    SC.show = o;
};

SC.onImportNetlist = function () {
    // Import netlist made in stripboard.html
    CA.chooseFiles(function (aFiles) {
        console.log(aFiles[0]);
        var c, data = JSON.parse(aFiles[0].data);
        SC.netlistImport(data, SC.components.toObject());
        SC.filename = aFiles[0].name;
        SC.v.zoom = 20;
        c = SC.components.center();
        SC.v.centerTo(c.x, c.y);
        SC.render();
    }, '.netlist', true);
};

SC.importNetlistFromStorage = function () {
    // When both tools live on same domain they can send netlist guide localStorage, this imports the netlist
    if (CA.storage.keyExists('STRIPBOARD.netlist')) {
        var c, o = CA.storage.readObject('STRIPBOARD.netlist'), of = SC.filename;
        if (SC.importNetlistWithoutConfirm || confirm('Do you want to import netlist ' + o.filename)) {
            SC.filename = o.filename.split('.')[0] + '.schematic';
            if (of === SC.filename) {
                SC.netlistImport(o.netlist, SC.components.toObject(), SC.guides.toObject());
            } else {
                SC.netlistImport(o.netlist);
            }
            SC.v.zoom = 20;
            c = SC.components.center();
            SC.v.centerTo(c.x, c.y);
            // show checkbox
            SC.show.selection = true;
            SC.e.show_selection.checked = true;
            SC.show.net_numbers = false;
            SC.e.show_net_numbers.checked = false;
            SC.show.net_crossings = true;
            SC.e.show_net_crossings.checked = true;
            SC.show.guides = true;
            SC.e.show_guides.checked = true;
            SC.show.net_black = false;
            SC.e.show_net_black.checked = false;
            // default tool and render
            SC.onTool({target: {id: 'tool_select'}});
            SC.render();
        }
        if (SC.clearStorageAfterImport) {
            CA.storage.removeItem('STRIPBOARD.netlist');
        }
    }
};

SC.onSpread = function () {
    // Place components by type
    SC.undo.push();
    SC.guides.item = [];
    SC.autoplaceByType();
    SC.render();
};

SC.onStripboard = function () {
    // Go back to stripboard
    document.location = 'stripboard.html';
};

SC.onTool = function (event) {
    // Change tool
    CA.removeClass('selected');
    if (document.getElementById(event.target.id)) {
        document.getElementById(event.target.id).classList.add('selected');
        SC.tool = event.target.id.replace('tool_', '');
    }
};

SC.onUndo = function () {
    // Undo last change
    if (!SC.undo.pop()) {
        CA.beep(666, 100, 50, "sine");
    }
    SC.render();
};

window.addEventListener('DOMContentLoaded', function () {
    // Initialize
    SC.e = CA.elementsWithId();

    // show
    SC.e.show_selection.onclick = SC.onShow;
    SC.e.show_net_numbers.onclick = SC.onShow;
    SC.e.show_net_crossings.onclick = SC.onShow;
    SC.e.show_guides.onclick = SC.onShow;
    SC.e.show_net_black.onclick = SC.onShow;

    // tool
    SC.e.tool_select.onclick = SC.onTool;
    SC.e.tool_guide.onclick = SC.onTool;

    // action
    SC.e.tool_undo.onclick = SC.onUndo;
    SC.e.tool_clear.onclick = SC.onClear;
    SC.e.tool_clear_guides.onclick = SC.onClearGuides;
    SC.e.tool_export.onclick = SC.onExport;
    SC.e.tool_import.onclick = SC.onImport;
    SC.e.tool_import_placement.onclick = SC.onImportPlacement;
    SC.e.tool_screenshot.onclick = SC.onScreenshot;
    SC.e.tool_import_netlist.onclick = SC.onImportNetlist;
    SC.e.tool_spread.onclick = SC.onSpread;
    SC.e.tool_stripboard.onclick = SC.onStripboard;

    // layers
    SC.layer = {
        component: CA.canvas('component'),
        control: CA.canvas('control')
    };

    // viewport
    SC.v = new CA.Viewport(SC.layer.control.canvas, SC.render);
    SC.v.zoom = 20;
    SC.v.y = 100;
    SC.v.onzoom = function () {
        SC.e.status_zoom.textContent = SC.v.zoom.toFixed(2);
    };

    // components
    SC.components = new SC.Components();
    SC.nets = new SC.Nets();
    SC.guides = new SC.Guides();

    SC.loadImagesAndTransform(SC.specsPin, function () {
        SC.onLoad();
        SC.importNetlistFromStorage();
        // undo
        SC.undo = new CA.Undo({
            components: SC.components,
            nets: SC.nets,
            guides: SC.guides
        }, 30, 3600);
    });

    SC.layer.control.canvas.addEventListener('dblclick', function (event) {
        // Add guide to nearest net
        if (event.button === 0) {
            var c = SC.v.screenToCanvas(event.offsetX, event.offsetY, true);
            if (SC.show.guides) {
                SC.undo.push();
                SC.guides.add(c.x, c.y);
            }
            SC.render();
        }
    });

    SC.layer.control.canvas.addEventListener('mousedown', function (event) {
        // select
        var c = SC.v.screenToCanvas(event.offsetX, event.offsetY), v;
        if (event.button === 0 && SC.tool === 'select') {
            // find nearest guide
            v = SC.guides.findNearest(c.x, c.y);
            if (v.distance < 1) {
                // select guide
                SC.selected = v.item;
                SC.e.status_element.textContent = 'Guide net #' + v.item.net;
            } else {
                // select component
                SC.selected = SC.components.findByXY(c.x, c.y);
                SC.e.status_element.textContent = SC.selected ? SC.selected.name : 'none';
            }
            // start moving component
            SC.moving = SC.selected;
            if (SC.moving) {
                SC.undo.push();
                SC.movingStart = {x: SC.moving.x, y: SC.moving.y};
                SC.movingDelta = c;
            }
        }
        // start new guide
        if (event.button === 0 && SC.tool === 'guide' && !event.shiftKey) {
            SC.undo.push();
            // add first guide (this also finds the net for this guide wire)
            SC.guide = SC.guides.add(c.x, c.y);
            // prepare cache so that we don't constatly add new guides on the same spot
            SC.guideCache = SC.guides.cacheXY();
        }
        // removing guides
        if (event.button === 0 && SC.tool === 'guide' && event.shiftKey) {
            v = SC.guides.findNearest(c.x, c.y);
            if (v.distance <= 0.5) {
                SC.undo.push();
                SC.removingGuide = v.item;
                SC.guides.removeXYNet(c.x, c.y, SC.removingGuide.net);
            }
        }
        SC.render();
    });

    window.addEventListener('mouseup', function () {
        // Finish moving component
        if (SC.moving) {
            //SC.guides.removePinGuide(SC.moving);
            SC.moving = undefined;
            SC.render();
        }
        // finish guide (remove any guides that ended in pins)
        if (SC.guide) {
            SC.guides.removeGuidesOnPins(SC.guideCache);
            SC.guide = null;
            SC.guideCache = null;
            SC.render();
        }
        SC.removingGuide = null;
    });

    SC.layer.control.canvas.addEventListener('mousemove', function (event) {
        // Mouse move
        if (!SC.v) {
            return;
        }

        // Show X/Y coordinates at the bottom
        var c = SC.v.screenToCanvas(event.offsetX, event.offsetY),
            g = SC.v.screenToCanvas(event.offsetX, event.offsetY, true),
            v;
        SC.e.status_x.textContent = c.x.toFixed(3) + ' (' + Math.round(c.x) + ')';
        SC.e.status_y.textContent = c.y.toFixed(3) + ' (' + Math.round(c.y) + ')';

        // continue moving component
        if (SC.moving) {
            SC.moving.x = SC.movingStart.x + Math.round(c.x - SC.movingDelta.x);
            SC.moving.y = SC.movingStart.y + Math.round(c.y - SC.movingDelta.y);
            SC.movingPoint = c;
            SC.render();
        }

        // continue adding guides to current guide
        if (SC.guide) {
            if (!SC.guideCache[g.x + ' ' + g.y]) {
                v = SC.guides.add(g.x, g.y);
                if (v) {
                    v.net = SC.guide.net;
                    SC.guideCache[g.x + ' ' + g.y] = v;
                }
                SC.render();
            }
        }

        // continue removing guides
        if (SC.removingGuide) {
            SC.guides.removeXYNet(c.x, c.y, SC.removingGuide.net);
            SC.render();
        }

        // show name of selected element
        if (SC.selected) {
            SC.e.status_element.textContent = SC.selected.name;
        } else {
            SC.e.status_element.textContent = 'none';
        }
    });

    window.addEventListener('keydown', function (event) {
        // Shortcut keys
        if (!event.ctrlKey && SC.selected && (SC.tool === 'select')) {
            // delete guides
            if (event.key === 'Delete' && SC.selected && SC.selected instanceof SC.Guide) {
                SC.guides.remove(SC.selected);
                SC.selected = null;
                SC.render();
            }
            // flip seleted
            if (event.key === 'f') {
                SC.selected.mirror = !SC.selected.mirror;
                SC.selected.updatePins();
                SC.render();
            }
            // rotate seleted
            if (event.key === 'r') {
                SC.selected.rotate = (SC.selected.rotate + 1) % 4;
                SC.selected.updatePins();
                SC.render();
            }
        }
        // Esc = back to "Select" tool
        if (event.key === 'Escape') {
            SC.onTool({target: {id: 'tool_select'}});
        }
        // Ctrl+z
        if (event.ctrlKey && event.key === 'z') {
            SC.onUndo();
        }
        // G = guide
        if (!event.ctrlKey && event.key === 'g') {
            SC.onTool({target: {id: 'tool_guide'}});
        }
        // S = select
        if (!event.ctrlKey && event.key === 's') {
            SC.onTool({target: {id: 'tool_select'}});
        }
    });

    window.addEventListener('resize', SC.render);
    window.addEventListener('beforeunload', function () {
        if (SC.autosave) {
            SC.onSave();
        }
    });
});
