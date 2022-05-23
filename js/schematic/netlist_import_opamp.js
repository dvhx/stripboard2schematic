// Import TL071 not as dip8 but as triangle opamp with separate rails
"use strict";
// globals: document, window, CA

var SC = window.SC || {};

SC.netlistImportSchematic = SC.netlistImportSchematic || {};

SC.netlistImportSchematic.dip8_opamp_single = function (aObject, aOldComponents) {
    // Show single opamp as DIP8 with internal schematic
    CA.unused(aOldComponents);
    aObject.type = 'dip8_opamp_single';
    return false;
};

SC.netlistImportSchematic.dip8_opamp_dual = function (aObject, aOldComponents) {
    // Show dual opamp as DIP8 with internal schematic
    CA.unused(aOldComponents);
    aObject.type = 'dip8_opamp_dual';
    return false;
};

SC.netlistImportSchematic.opamp_single = function (aObject, aOldComponents) {
    // Convert DIP8 opamp_single to one triangle
    var i, c, v, ofs1, ofs2,
        type = aObject.type,                // dip8
        value = aObject.value,              // TL071
        name = aObject.name,                // IC1
        nets = aObject.nets,                // [2, 7, 6, 11, 9, 7, 5, 3]
        pinout = aObject.pinout.split(','), // OFS1,IN-,IN+,V-,V-,OFS2,OUT,V+,NC,
        pin_net = {},                       // {'OFS1': 2, "IN-": 7, ...}
        unused = {};                        // pins that hasn't been used, at the end should only contain NC* pins
    //console.log('pinout', pinout);
    //console.log('nets', nets);
    for (i = 0; i < pinout.length; i++) {
        pin_net[pinout[i]] = nets[i];
        unused[pinout[i]] = 1;
    }
    //console.log(type, value, name, nets, pinout, pin_net);
    // create triangle opamp component
    c = new SC.Component('opamp_triangle_3pin', name, value, 1, 10, 0, false);
    SC.components.item.push(c);
    // inverting, non-inverting, output
    SC.nets.addComponentPin(pin_net['IN-'], c, c.pinByName('IN-'));
    SC.nets.addComponentPin(pin_net['IN+'], c, c.pinByName('IN+'));
    SC.nets.addComponentPin(pin_net['OUT'], c, c.pinByName('OUT'));
    delete unused['IN-'];
    delete unused['IN+'];
    delete unused['OUT'];
    c.restoreFromComponents(aOldComponents);
    // V+
    v = new SC.Component('connector', name + '.' + (pinout.indexOf('V+') + 1), 'V+', c.x, c.y - 3, 0, false);
    SC.components.item.push(v);
    SC.nets.addComponentPin(pin_net['V+'], v, 0);
    delete unused['V+'];
    v.restoreFromComponents(aOldComponents);
    // V-
    v = new SC.Component('connector', name + '.' + (pinout.indexOf('V-') + 1), 'V-', c.x, c.y + 3, 0, false);
    SC.components.item.push(v);
    SC.nets.addComponentPin(pin_net['V-'], v, 0);
    delete unused['V-'];
    v.restoreFromComponents(aOldComponents);

    // offset
    if (aObject.schematic === "opamp_single_offset") {
        // offset 1
        ofs1 = new SC.Component('connector', name + '.1', 'OFS1', c.x, c.y - 3, 0, false);
        SC.components.item.push(ofs1);
        SC.nets.addComponentPin(pin_net['OFS1'], ofs1, 0);
        ofs1.restoreFromComponents(aOldComponents);
        // offset 2
        ofs2 = new SC.Component('connector', name + '.5', 'OFS2', c.x + 1, c.y - 3, 0, false);
        SC.components.item.push(ofs2);
        SC.nets.addComponentPin(pin_net['OFS2'], ofs2, 0);
        ofs2.restoreFromComponents(aOldComponents);
    }

    // delete the remaining
    delete unused['OFS1'];
    delete unused['OFS2'];
    delete unused['NC'];
    delete unused['NC1'];
    delete unused['NC2'];
    delete unused['NC3'];
    unused = Object.keys(unused);
    if (unused.length > 0) {
        alert(type + ' ' + name + ' has unused pin (' + unused.join(', ') + '). Use NC1, NC2, NC3 for non-connected pins');
    }
    return c;
};

SC.netlistImportSchematic.opamp_single_offset = function (aObject, aOldComponents) {
    // Convert DIP8 opamp_single to one triangle with offset circuit
    return SC.netlistImportSchematic.opamp_single(aObject, aOldComponents);
};

SC.netlistImportSchematic.opamp_dual = function (aObject, aOldComponents) {
    // Convert DIP8 opamp single to two triangles
    var i, c, v,
        type = aObject.type,                // dip8
        value = aObject.value,              // TL072
        name = aObject.name,                // IC1
        nets = aObject.nets,                // [5, 7, 12, 17, 12, 10, 8, 6]
        pinout = aObject.pinout.split(','), // ['OUT1', 'IN1-', 'IN1+', 'V-', 'IN2+', 'IN2-', 'OUT2', 'V+']
        pin_net = {},                       // {'OUT1': 5, "IN1-": 7, ...}
        unused = {};                        // pins that hasn't been used, at the end should be empty?
    //console.log('pinout', pinout);
    //console.log('nets', nets);
    for (i = 0; i < pinout.length; i++) {
        pin_net[pinout[i]] = nets[i];
        unused[pinout[i]] = 1;
    }
    //console.log(type, value, name, nets, pinout, pin_net);

    // create triangle opamp component
    c = new SC.Component('opamp_triangle_3pin', name + '.A', value, 1, 10, 0, false);
    SC.components.item.push(c);
    // inverting, non-inverting, output
    SC.nets.addComponentPin(pin_net['IN1-'], c, c.pinByName('IN-'));
    SC.nets.addComponentPin(pin_net['IN1+'], c, c.pinByName('IN+'));
    SC.nets.addComponentPin(pin_net['OUT1'], c, c.pinByName('OUT'));
    delete unused['IN1-'];
    delete unused['IN1+'];
    delete unused['OUT1'];
    c.restoreFromComponents(aOldComponents);

    // create triangle opamp component
    c = new SC.Component('opamp_triangle_3pin', name + '.B', value, 1 + 1, 10 + 1, 0, false);
    SC.components.item.push(c);
    // inverting, non-inverting, output
    SC.nets.addComponentPin(pin_net['IN2-'], c, c.pinByName('IN-'));
    SC.nets.addComponentPin(pin_net['IN2+'], c, c.pinByName('IN+'));
    SC.nets.addComponentPin(pin_net['OUT2'], c, c.pinByName('OUT'));
    delete unused['IN2-'];
    delete unused['IN2+'];
    delete unused['OUT2'];
    c.restoreFromComponents(aOldComponents);

    // V+
    v = new SC.Component('connector', name + '.' + (pinout.indexOf('V+') + 1), 'V+', c.x, c.y - 3, 0, false);
    SC.components.item.push(v);
    SC.nets.addComponentPin(pin_net['V+'], v, 0);
    delete unused['V+'];
    v.restoreFromComponents(aOldComponents);
    // V-
    v = new SC.Component('connector', name + '1.' + (pinout.indexOf('V-') + 1), 'V-', c.x, c.y + 3, 0, false);
    SC.components.item.push(v);
    SC.nets.addComponentPin(pin_net['V-'], v, 0);
    delete unused['V-'];
    v.restoreFromComponents(aOldComponents);

    // delete the remaining
    delete unused['OFS1'];
    delete unused['OFS2'];
    delete unused['NC'];
    delete unused['NC1'];
    delete unused['NC2'];
    delete unused['NC3'];
    unused = Object.keys(unused);
    if (unused.length > 0) {
        alert(type + ' ' + name + ' has unused pin (' + unused.join(', ') + '). Use NC1, NC2, NC3 for non-connected pins');
    }
    return true;
};

SC.netlistImportSchematic.opamp_quad = function (aObject, aOldComponents) {
    // Convert DIP14 opamp to 4 triangles
    var i, c, v,
        type = aObject.type,                // dip14
        value = aObject.value,              // TL074
        name = aObject.name,                // IC1
        nets = aObject.nets,                // [15, 15, 8, 6, 8, 17, 17, 19, 19, 8, 7, 8, 21, 21]
        pinout = aObject.pinout.split(','), // "OUT1,IN1-,IN1+,V+,IN2+,IN2-,OUT2,OUT3,IN3-,IN3+,V-,IN4+,IN4-,OUT4"
        pin_net = {},                       // {'OUT1': , "IN1-": , ...}
        unused = {};                        // pins that hasn't been used, at the end should be empty?

    //console.log('pinout', pinout);
    //console.log('nets', nets);
    for (i = 0; i < pinout.length; i++) {
        pin_net[pinout[i]] = nets[i];
        unused[pinout[i]] = 1;
    }
    //console.log(type, value, name, nets, pinout, pin_net);

    // create triangle opamp component
    c = new SC.Component('opamp_triangle_3pin', name + '.A', value, 1, 10, 0, false);
    SC.components.item.push(c);
    // inverting, non-inverting, output
    SC.nets.addComponentPin(pin_net['IN1-'], c, c.pinByName('IN-'));
    SC.nets.addComponentPin(pin_net['IN1+'], c, c.pinByName('IN+'));
    SC.nets.addComponentPin(pin_net['OUT1'], c, c.pinByName('OUT'));
    delete unused['IN1-'];
    delete unused['IN1+'];
    delete unused['OUT1'];
    c.restoreFromComponents(aOldComponents);

    // create triangle opamp component
    c = new SC.Component('opamp_triangle_3pin', name + '.B', value, 1 + 1, 10 + 1, 0, false);
    SC.components.item.push(c);
    // inverting, non-inverting, output
    SC.nets.addComponentPin(pin_net['IN2-'], c, c.pinByName('IN-'));
    SC.nets.addComponentPin(pin_net['IN2+'], c, c.pinByName('IN+'));
    SC.nets.addComponentPin(pin_net['OUT2'], c, c.pinByName('OUT'));
    delete unused['IN2-'];
    delete unused['IN2+'];
    delete unused['OUT2'];
    c.restoreFromComponents(aOldComponents);

    // create triangle opamp component
    c = new SC.Component('opamp_triangle_3pin', name + '.C', value, 1 + 2, 10 + 2, 0, false);
    SC.components.item.push(c);
    // inverting, non-inverting, output
    SC.nets.addComponentPin(pin_net['IN3-'], c, c.pinByName('IN-'));
    SC.nets.addComponentPin(pin_net['IN3+'], c, c.pinByName('IN+'));
    SC.nets.addComponentPin(pin_net['OUT3'], c, c.pinByName('OUT'));
    delete unused['IN3-'];
    delete unused['IN3+'];
    delete unused['OUT3'];
    c.restoreFromComponents(aOldComponents);

    // create triangle opamp component
    c = new SC.Component('opamp_triangle_3pin', name + '.D', value, 1 + 3, 10 + 3, 0, false);
    SC.components.item.push(c);
    // inverting, non-inverting, output
    SC.nets.addComponentPin(pin_net['IN4-'], c, c.pinByName('IN-'));
    SC.nets.addComponentPin(pin_net['IN4+'], c, c.pinByName('IN+'));
    SC.nets.addComponentPin(pin_net['OUT4'], c, c.pinByName('OUT'));
    delete unused['IN4-'];
    delete unused['IN4+'];
    delete unused['OUT4'];
    c.restoreFromComponents(aOldComponents);

    // V+
    v = new SC.Component('connector', name + '.' + (pinout.indexOf('V+') + 1), 'V+', c.x, c.y - 3, 0, false);
    SC.components.item.push(v);
    SC.nets.addComponentPin(pin_net['V+'], v, 0);
    delete unused['V+'];
    v.restoreFromComponents(aOldComponents);
    // V-
    v = new SC.Component('connector', name + '.' + (pinout.indexOf('V-') + 1), 'V-', c.x, c.y + 3, 0, false);
    SC.components.item.push(v);
    SC.nets.addComponentPin(pin_net['V-'], v, 0);
    delete unused['V-'];
    v.restoreFromComponents(aOldComponents);

    // delete the remaining
    delete unused['NC'];
    delete unused['NC1'];
    delete unused['NC2'];
    delete unused['NC3'];
    unused = Object.keys(unused);
    if (unused.length > 0) {
        alert(type + ' ' + name + ' has unused pin (' + unused.join(', ') + '). Use NC1, NC2, NC3 for non-connected pins');
    }
    return true;
};


