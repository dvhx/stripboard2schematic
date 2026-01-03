// Main
"use strict";
// globals: document, window, CA

var SC = window.SC || {};

SC.purge = function () {
    // Clear all and reload
    SC.autosave = false;
    CA.storage.removeAll();
    document.location.reload();
};

SC.frames = 0;
SC.render = function () {
    // Main rendering function
    CA.perf.begin('render');
    SC.frames++;
    SC.layer.ground.clear();
    SC.layer.copper.clear();
    SC.layer.component.clear();
    SC.layer.grid.clear();
    SC.layer.control.clear();
    SC.layer.selected.clear();
    SC.layer.nearest.clear();
    if (SC.grid) {
        SC.grid.render(SC.layer.grid.context);
    }
    SC.components.render(SC.layer.component.context);
    // nearest outline
    SC.layer.nearest.clear();
    if (SC.nearest && SC.show.selection && SC.selected !== SC.nearest) {
        SC.renderOutline(SC.nearest, SC.layer.nearest.context, 'red');
    }
    // selected outline
    if (SC.selected && SC.show.selection) {
        SC.renderOutline(SC.selected, SC.layer.selected.context, 'lime');
    }
    CA.perf.end('render');
};

SC.resetCheckboxes = function () {
    // Set show checkboxes to it's default position (after clear, import, ...)
    // tool
    SC.onTool({target: {id: 'tool_select'}});

    // show
    SC.show.copper = true;
    SC.e.show_copper.checked = true;
    SC.show.copper_opacity = 0.5;
    SC.e.show_copper_opacity.value = 0.5;
    SC.layer.copper.canvas.style.opacity = SC.show.copper_opacity;

    SC.show.background = true;
    SC.e.show_background.checked = true;

    SC.show.net_numbers = false;
    SC.e.show_net_numbers.checked = false;

    SC.show.components = true;
    SC.e.show_components.checked = true;
    SC.show.components_opacity = 0.5;
    SC.e.show_components_opacity.value = 0.5;

    SC.show.selection = true;
    SC.e.show_selection.checked = true;
};

SC.onClear = function () {
    // Clear all components
    if (confirm('Clear all components?')) {
        SC.undo.push();
        SC.resetCheckboxes();
        SC.grid.image.src = SC.emptyImage;
        SC.grid.width = 1;
        SC.grid.height = 1;
        SC.grid.x1 = 0;
        SC.grid.y1 = 0;
        SC.grid.x2 = 0;
        SC.grid.y2 = 0;
        SC.grid.updateNets();
        SC.v.x = 10;
        SC.v.y = 10;
        SC.v.zoom = 1;
        SC.filename = 'noname.stripboard';
        SC.components.item = [];
        SC.selected = null;
        SC.nearest = null;
        SC.render();
    }
};

SC.onNetlist = function () {
    // Export netlist (can be imported to schematic.html)
    var n = SC.netlist(), fn = SC.filename.split('.')[0];
    if (n.errors.length > 0) {
        if (!alert('Errors found:\n\n' + n.errors.join('\n'))) {
            return;
        }
    }
    if (n.missing.length > 0) {
        if (!confirm('Missing connectors: ' + n.missing.join(', ') + '\n\nDo you still wish to generate netlist?')) {
            return;
        }
    }
    CA.download(JSON.stringify(n.netlist, undefined, 4), fn + '.netlist');
};

SC.onPartsList = function () {
    // Download json partslist for WCIB
    var a = [], i, b = {}, p = 0, t = 0,
        net = SC.netlist();
    net.netlist.forEach(function (e) {
        if (e.type === 'ground' || (e.type === 'connector' && (e.name === 'Input' || e.name === 'Output'))) {
            return;
        }
        if (e.type === 'potentiometer') {
            p++;
            e.name = 'P' + p + '_' + e.name;
        }
        if (e.type.indexOf('transistor') >= 0) {
            if (e.type.indexOf('_regulator') < 0) {
                //t++;
                //e.name = 'T' + t + '_' + e.name.replace(/^Q/, '');
                e.name = e.name.replace(/^Q/, 'T');
            }
        }
        if (e.type.indexOf('_regulator') >= 0) {
            e.name = e.name + '_REG';
        }
        a.push({name: e.name.replace(/^IC/, 'Q'), type: e.type, value: e.value});
    });

    for (i in net.spst) {
        if (net.spst.hasOwnProperty(i)) {
            a.push({name: i, type: 'SPST', value: 'SPST'});
        }
    }
    for (i in net.spdt) {
        if (net.spdt.hasOwnProperty(i)) {
            a.push({name: i, type: 'SPDT', value: 'SPDT'});
        }
    }
    for (i in net.dpdt) {
        if (net.dpdt.hasOwnProperty(i)) {
            a.push({name: i, type: 'DPDT', value: 'DPDT'});
        }
    }

    a = a.sort(function (u, v) {
        if (u.type === v.type) {
            return parseFloat(u.name.match(/[0-9]+/)) - parseFloat(v.name.match(/[0-9]+/));
        }
        if (u.name === v.name) {
            return 0;
        }
        return u.name < v.name ? -1 : +1;
    });
    for (i = 0; i < a.length; i++) {
        //console.log(a[i].name, a[i]);
        if (a[i].value === undefined) {
            console.warn(a[i]);
        }
        if (b[a[i].name]) {
            alert('Duplicate name ' + a[i].name);
        }
        b[a[i].name] = a[i].value ? a[i].value.toString() : a[i].value;
    }
    b = {
        name: SC.filename,
        author: '',

        "url": {
            "schematic": "",
            "stripboard": "",
            "perfboard": "",
            "pcb": "",
            "tagboard": "",
            "pedal": ""
        },

        parts: b
    };
    CA.download(JSON.stringify(b, undefined, 4), SC.filename + '_parts.json');
};

SC.onSchematic = function () {
    // Export netlist and open it in schematic.html
    var n = SC.netlist(), fn = SC.filename.split('.')[0];
    if (n.errors.length > 0) {
        if (!alert('Errors found:\n\n' + n.errors.join('\n'))) {
            return;
        }
    }
    if (n.missing.length > 0) {
        if (!confirm('Missing connectors: ' + n.missing.join(', ') + '\n\nDo you still wish to download netlist?')) {
            return;
        }
    }
    CA.storage.writeObject('STRIPBOARD.netlist', {
        filename: fn,
        netlist: n.netlist
    });
    document.location = SC.netlist2SchematicUrl;
};

SC.onExport = function () {
    // Export all data
    var s = prompt('Export as (*.stripboard)', SC.filename), o;
    if (s) {
        if (!s.match('.stripboard')) {
            s += '.stripboard';
        }
        o = {
            format: 'stripboard-0.1',
            filename: s,
            tool: SC.tool,
            viewport: SC.v.toObject(),
            grid: SC.grid.toObject(),
            components: SC.components.toObject()
        };
        CA.download(JSON.stringify(o, undefined, 1), s);
        SC.filename = s;
    }
};

SC.onImport = function () {
    // Import .stripboard file
    CA.chooseFiles(function (aFiles) {
        var o = JSON.parse(aFiles[0].data);
        SC.selected = null;
        SC.nearest = null;
        SC.filename = o.filename;
        SC.tool = o.tool;
        SC.v.fromObject(o.viewport);
        SC.grid.fromObject(o.grid);
        SC.components.fromObject(o.components);
        SC.resetCheckboxes();
        SC.render();
    }, '.stripboard', true);
};

SC.onSave = function () {
    // Save current scene to local storage
    CA.storage.writeString('STRIPBOARD.filename', SC.filename);
    CA.storage.writeString('STRIPBOARD.tool', SC.tool);
    CA.storage.writeObject('STRIPBOARD.v', SC.v.toObject());
    CA.storage.writeObject('STRIPBOARD.components', SC.components.toObject());
    CA.storage.writeObject('STRIPBOARD.grid', SC.grid.toObject());
    CA.storage.writeObject('STRIPBOARD.show', SC.show);
};

SC.onLoad = function () {
    // Load scene from local storage
    SC.filename = CA.storage.readString('STRIPBOARD.filename', SC.filename);
    SC.show = CA.storage.readObject('STRIPBOARD.show', SC.show);
    SC.v.fromObject(CA.storage.readObject('STRIPBOARD.v', SC.v.toObject()));
    SC.components.fromObject(CA.storage.readObject('STRIPBOARD.components', {component: []}));
    SC.grid = new SC.Grid(0, 0, 1, 1, 1, 1);
    SC.grid.fromObject(CA.storage.readObject('STRIPBOARD.grid', SC.grid));
    SC.render();
    SC.tool = CA.storage.readString('STRIPBOARD.tool', SC.tool);
    if (SC.tool !== 'grid_size') {
        SC.e['tool_' + SC.tool].click();
    }
    // show checkboxes
    SC.resetCheckboxes();
    /*
    SC.e.show_copper.checked = SC.show.copper;
    SC.e.show_copper_opacity.value = SC.show.copper_opacity;
    SC.layer.copper.canvas.style.opacity = SC.show.copper_opacity;
    SC.e.show_components.checked = SC.show.components;
    SC.e.show_components_opacity.value = SC.show.components_opacity;
    SC.e.show_background.checked = SC.show.background;
    SC.e.show_net_numbers.checked = SC.show.net_numbers;
    SC.e.show_selection.checked = SC.show.selection;
    */
};

SC.onTool = function (event) {
    // Change tool
    SC.connectorNextName = '';
    SC.tool = event.target.id.replace('tool_', '');
    CA.removeClass('selected');
    if (document.getElementById(event.target.id)) {
        document.getElementById(event.target.id).classList.add('selected');
    }
    SC.render();
};

SC.onToolSpecialConnector = function (event) {
    // This makes Ground/Input/Output connector use preset name, no dialog will be shown
    SC.onTool(event);
    SC.tool = 'connector';
    SC.connectorNextName = event.target.textContent;
};

SC.onShow = function (event) {
    // Click on show checkbox
    SC.show[event.target.id.replace('show_', '')] = event.target.checked;
    SC.show.copper_opacity = parseFloat(SC.e.show_copper_opacity.value);
    SC.show.components_opacity = parseFloat(SC.e.show_components_opacity.value);
    SC.layer.copper.canvas.style.opacity = SC.show.copper_opacity;
    SC.nearest = null;
    SC.selected = null;
    SC.layer.nearest.clear();
    SC.layer.selected.clear();
    SC.render();
};

SC.onBgImage = function (event) {
    // Let user choose image, resize it, save it as url data string
    if (event.ctrlKey) {
        var s = prompt('Image URL', 'https://').trim();
        if (s) {
            SC.filename = s;
            SC.grid.image.src = s;
        }
        return;
    }
    CA.chooseImage(function (aCanvas, aFilename) {
        SC.filename = aFilename.split('.')[0] + '.stripboard';
        CA.reduceColors(aCanvas, 8);
        var a = aCanvas.toDataURL('image/png'),
            b = aCanvas.toDataURL('image/jpeg', 0.8);
        console.log('png', a.length);
        console.log('jpg', b.length);
        s = a.length < b.length ? a : b;
        SC.grid.image.src = s;
    }, 1000); // 800
};

SC.onGridSize = function () {
    // show dialog where user defines grid size
    SC.undo.push();
    SC.grid.dialog();
};

SC.onGridExpand = function () {
    // Add one strip to the bottom of the grid, preserves cuts
    SC.undo.push();
    SC.grid.expand();
    SC.render();
};

SC.onUndo = function () {
    // Undo last change
    if (!SC.undo.pop()) {
        CA.beep(666, 100, 50, "sine");
    }
    SC.selected = null;
    SC.render();
};

window.addEventListener('DOMContentLoaded', function () {
    // Initialize
    SC.e = CA.elementsWithId();

    SC.e.show_copper.onclick = SC.onShow;
    SC.e.show_copper_opacity.oninput = SC.onShow;
    SC.e.show_components_opacity.oninput = SC.onShow;
    SC.e.show_components.onclick = SC.onShow;
    SC.e.show_background.onclick = SC.onShow;
    SC.e.show_net_numbers.onclick = SC.onShow;
    SC.e.show_selection.onclick = SC.onShow;

    SC.e.tool_select.onclick = SC.onTool;
    SC.e.tool_grid_placement.onclick = SC.onTool;

    SC.e.tool_copper_cut.onclick = SC.onTool;
    SC.e.tool_resistor.onclick = SC.onTool;
    SC.e.tool_ldr.onclick = SC.onTool;
    SC.e.tool_led.onclick = SC.onTool;
    SC.e.tool_capacitor.onclick = SC.onTool;
    SC.e.tool_inductor.onclick = SC.onTool;
    SC.e.tool_diode.onclick = SC.onTool;
    SC.e.tool_transistor.onclick = SC.onTool;
    SC.e.tool_trimmer.onclick = SC.onTool;
    SC.e.tool_dip.onclick = SC.onTool;
    SC.e.tool_connector.onclick = SC.onTool;
    SC.e.tool_connector_battery.onclick = SC.onTool;
    SC.e.tool_connector_pot.onclick = SC.onTool;
    SC.e.tool_connector_switch_spst.onclick = SC.onTool;
    SC.e.tool_connector_switch_spdt.onclick = SC.onTool;
    SC.e.tool_connector_switch_dpdt.onclick = SC.onTool;
    SC.e.tool_link.onclick = SC.onTool;

    SC.e.tool_connector_input.onclick = SC.onToolSpecialConnector;
    SC.e.tool_connector_output.onclick = SC.onToolSpecialConnector;
    SC.e.tool_connector_ground.onclick = SC.onToolSpecialConnector;

    SC.e.tool_undo.onclick = SC.onUndo;
    SC.e.tool_bg_image.onclick = SC.onBgImage;
    SC.e.tool_grid_size.onclick = SC.onGridSize;
    SC.e.tool_grid_expand.onclick = SC.onGridExpand;
    SC.e.tool_clear.onclick = SC.onClear;
    SC.e.tool_export.onclick = SC.onExport;
    SC.e.tool_import.onclick = SC.onImport;
    SC.e.tool_netlist.onclick = SC.onNetlist;
    SC.e.tool_schematic.onclick = SC.onSchematic;
    SC.e.tool_parts_list.onclick = SC.onPartsList;

    SC.layer = {
        ground: CA.canvas('ground'),
        component: CA.canvas('component'),
        grid: CA.canvas('grid'),
        copper: CA.canvas('copper'),
        nearest: CA.canvas('nearest'),
        selected: CA.canvas('selected'),
        control: CA.canvas('control')
    };

    // viewport
    SC.v = new CA.Viewport(SC.layer.control.canvas, SC.render);
    SC.v.zoom = 1;
    SC.v.x = 0;
    SC.v.y = 0;
    SC.v.onzoom = function () {
        SC.e.status_zoom.textContent = SC.v.zoom.toFixed(2);
    };


    // load images
    CA.images([
        'image/stripboard/resistor.png',
        'image/stripboard/capacitor_blob.png',
        'image/stripboard/inductor.png',
        'image/stripboard/diode.png',
        'image/stripboard/led.png',
        'image/stripboard/ldr.png',
        'image/stripboard/TO-1.png',
        'image/stripboard/TO-5.png',
        'image/stripboard/TO-92.png',
        'image/stripboard/TO-126.png',
        'image/stripboard/TO-220.png',
        'image/stripboard/trimmer.png',
        'image/stripboard/trimmer_inline.png',
        'image/stripboard/pot_start.png',
        'image/stripboard/pot_wiper.png',
        'image/stripboard/pot_end.png'
    ], function (aImages) {
        // image cache with shorter names
        var k;
        SC.image = {};
        for (k in aImages) {
            if (aImages.hasOwnProperty(k)) {
                SC.image[k.replace(/^(image\/stripboard)\//, '').replace(/\.(png|jpg|gif|webp|bmp)$/, '')] = aImages[k]; // '
            }
        }

        SC.components = new SC.Components();
        SC.onLoad();

        // undo
        SC.undo = new CA.Undo({
            components: SC.components,
            grid: SC.grid
            // viewport?
        }, 30, 3600);
    });

    SC.layer.control.canvas.addEventListener('dblclick', function (event) {
        // Show properties dialog of component
        if (event.button === 0 && SC.selected) {
            SC.undo.push();
            SC.selected.propertiesDialog(SC.render);
        }
    });

    SC.layer.control.canvas.addEventListener('mousedown', function (event) {
        // Start adding component
        if (event.button === 0) {
            var s = SC.v.screenToCanvas(event.offsetX, event.offsetY, true),
                g = SC.grid.canvasToGrid(s.x, s.y, SC.tool.indexOf('connector') < 0);
            // new component
            if (SC.factory[SC.tool]) {
                if (SC.grid.width <= 1 || SC.grid.height <= 1) {
                    alert('Define grid size first by using "Grid size" action');
                    return;
                }
                if (SC.grid.x1 === SC.grid.x2 || SC.grid.y1 === SC.grid.y2) {
                    alert('Place grid first by using "Grid placement" tool');
                    return;
                }
                SC.undo.push();
                SC.adding = SC.components.add(SC.tool, g.x, g.y);
                SC.components.remove(SC.adding);
            }
            // select nearest
            if (SC.tool === 'select' && SC.nearest) {
                SC.selected = SC.nearest;
            }
            // grid placement
            if (SC.tool === 'grid_placement') {
                SC.undo.push();
                SC.grid.start = s;
                SC.grid.end = s;
            }
            SC.render();
        }
    });

    SC.layer.control.canvas.addEventListener('mouseup', function (event) {
        // Finish adding component
        var s = SC.v.screenToCanvas(event.offsetX, event.offsetY, true),
            g = SC.grid.canvasToGrid(s.x, s.y, SC.tool.indexOf('connector') < 0);
        if (event.button === 0 && SC.adding) {
            SC.adding.x2 = g.x;
            SC.adding.y2 = g.y;
            // some components check their pin order, invalid are removed
            if (SC.adding.fixPinOrder) {
                if (!SC.adding.fixPinOrder(true)) {
                    SC.components.remove(SC.adding);
                    SC.adding = undefined;
                    return;
                }
            }
            // Don't add if start and end are in the same hole, components require some span
            SC.components.remove(SC.adding);
            if ((SC.adding.x1 === SC.adding.x2) && (SC.adding.y1 === SC.adding.y2)) {
                //console.log('not adding multi-pin in one hole');
                SC.adding = undefined;
                SC.render();
                return;
            }
            // add component
            SC.add(SC.adding);
            SC.added = SC.adding;
            SC.adding = undefined;
        }
        // copper cuts
        if (event.button === 0 && SC.tool === 'copper_cut') {
            g = SC.grid.canvasToGrid(s.x, s.y, false);
            SC.undo.push();
            SC.grid.cut(g.x, g.y);
            SC.render();
        }
        // grid placement
        if (SC.grid.start && SC.tool === 'grid_placement') {
            SC.undo.push();
            SC.grid.x1 = SC.grid.start.x;
            SC.grid.y1 = SC.grid.start.y;
            SC.grid.x2 = SC.grid.end.x;
            SC.grid.y2 = SC.grid.end.y;
            SC.grid.start = null;
            SC.grid.end = null;
            SC.render();
        }
    });

    window.addEventListener('mouseup', function () {
        // handle off-screen mouseups
        SC.grid.start = null;
        SC.grid.end = null;
        SC.adding = undefined;
    });

    SC.layer.control.canvas.addEventListener('mousemove', function (event) {
        // Show X/Y coordinates at the bottom
        //document.title = event.button + ' ' + event.which;
        if (SC.v && SC.grid) {
            var s = SC.v.screenToCanvas(event.offsetX, event.offsetY, true),
                inside_grid = SC.tool.indexOf('connector') < 0,
                g = SC.grid.canvasToGrid(s.x, s.y, inside_grid),
                c = SC.grid.gridToCanvas(g.x, g.y),
                t = SC.v.canvasToScreen(c.x, c.y),
                a,
                b,
                n;
            SC.e.status_x.textContent = t.x.toFixed(3) + ' (' + g.x + ')';
            SC.e.status_y.textContent = t.y.toFixed(3) + ' (' + g.y + ')';
            SC.grid.x = g.x;
            SC.grid.y = g.y;
            // ball at current grid
            if (SC.tool !== 'select') {
                SC.layer.control.clear();
                SC.layer.control.circle(t.x, t.y, 2 * SC.v.zoom, null, null, '#0000ff55');
            }
            // render component being added
            if (SC.adding) {
                SC.adding.x2 = g.x;
                SC.adding.y2 = g.y;
                SC.layer.control.clear();
                SC.adding.render(SC.layer.control.context);
            }
            // highligh hovered element
            if (SC.tool === 'select') {
                SC.layer.nearest.clear();
                SC.layer.selected.clear();
                g = SC.grid.canvasToGridFloat(s.x, s.y);
                n = SC.components.findNearest(g.x, g.y, SC.show.components ? null : SC.Link);
                SC.nearest = n.component;
                // nearest
                if (SC.nearest) {
                    SC.e.status_element.textContent = n.component.name;
                    if (SC.show.selection && SC.selected !== SC.nearest) {
                        SC.renderOutline(n.component, SC.layer.nearest.context, 'red');
                    }
                }
                // selected
                if (SC.selected && SC.show.selection) {
                    SC.renderOutline(SC.selected, SC.layer.selected.context, 'lime');
                }
            }
            // defining grid
            if (SC.grid.start && (SC.tool === 'grid_placement')) {
                SC.grid.end = s;
                SC.layer.control.clear();
                a = SC.v.canvasToScreen(SC.grid.start.x, SC.grid.start.y);
                b = SC.v.canvasToScreen(SC.grid.end.x, SC.grid.end.y);
                SC.grid.renderDots(SC.layer.control.context, a.x, a.y, b.x, b.y);
            }
        }
    });

    window.addEventListener('keydown', function (event) {
        if (SC.selected && !CA.modalVisible) {
            // delete selected
            if (event.key === 'Delete') {
                if (confirm('Delete ' + SC.selected.type + ' ' + SC.selected.name + '?')) {
                    SC.undo.push();
                    SC.components.remove(SC.selected);
                    if (SC.nearest === SC.selected) {
                        SC.nearest = undefined;
                    }
                    SC.selected = undefined;
                    SC.layer.selected.clear();
                    SC.render();
                }
            }
            // flip seleted
            if (event.key === 'f' && SC.selected.flip) {
                SC.undo.push();
                SC.selected.flip();
                SC.render();
            }
        }
        // esc changes tool back to select
        if (event.key === 'Escape' && !CA.modalVisible) {
            SC.onTool({target: {id: 'tool_select'}});
        }
        // undo
        if (event.ctrlKey && event.key === 'z') {
            SC.onUndo();
        }
        // "c" copper
        if (!CA.modalVisible && event.key === 'c' && !event.ctrlKey) {
            SC.show.copper = !SC.show.copper;
            SC.e.show_copper.checked = SC.show.copper;
            SC.render();
        }
        // "b" background
        if (!CA.modalVisible && event.key === 'b' && !event.ctrlKey) {
            SC.show.background = !SC.show.background;
            SC.e.show_background.checked = SC.show.background;
            SC.render();
        }
        // "n" net numbers
        if (!CA.modalVisible && event.key === 'n' && !event.ctrlKey) {
            SC.show.net_numbers = !SC.show.net_numbers;
            SC.e.show_net_numbers.checked = SC.show.net_numbers;
            SC.render();
        }
        // "e" componEnts
        if (!CA.modalVisible && event.key === 'e' && !event.ctrlKey) {
            SC.show.components = !SC.show.components;
            SC.e.show_components.checked = SC.show.components;
            SC.render();
        }
    });

    window.addEventListener('resize', SC.render);
    window.addEventListener('beforeunload', function () {
        if (SC.autosave) {
            SC.onSave();
        }
    });
});
