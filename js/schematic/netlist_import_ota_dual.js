// Import LM13700 as two 5-pin triangles, two darlington buffers and 2 rails
"use strict";
// globals: document, window, CA

var SC = window.SC || {};

SC.netlistImportSchematic.ota_dual = function (aObject, aOldComponents) {
    // Convert DIP16 LM13700 to two triangles, two buffers and two rail pins
    var i, c, v,
        type = aObject.type,                // dip16
        value = aObject.value,              // LM13700
        name = aObject.name,                // IC1
        nets = aObject.nets,                // [1,  2,  3,   4,   5,   6, 7,   8,    9,    10,  11, 12,  13,  14,  15, 16]
        pinout = aObject.pinout.split(','), // [IB1 DB1 IN1+ IN1- OUT1 V- BIN1 BOUT1 BOUT2 BIN2 V+  OUT2 IN2- IN2+ DB2 IB2]
        pin_net = {},                       // {'OUT1': 5, "IN1-": 4, ...}
        unused = {};                        // pins that hasn't been used, at the end should be empty?
    //console.log('pinout', pinout);
    //console.log('nets', nets);
    for (i = 0; i < pinout.length; i++) {
        pin_net[pinout[i]] = nets[i];
        unused[pinout[i]] = 1;
    }
    //console.log(type, value, name, nets, pinout, pin_net);

    // create triangle OTA component
    c = new SC.Component('ota_triangle_5pin', name + '.A', value, 1, 10, 0, false);
    SC.components.item.push(c);
    // inverting, non-inverting, output
    SC.nets.addComponentPin(pin_net['IN1-'], c, c.pinByName('IN-'));
    SC.nets.addComponentPin(pin_net['DB1'], c, c.pinByName('DB'));
    SC.nets.addComponentPin(pin_net['IN1+'], c, c.pinByName('IN+'));
    SC.nets.addComponentPin(pin_net['OUT1'], c, c.pinByName('OUT'));
    SC.nets.addComponentPin(pin_net['AB1'], c, c.pinByName('IB'));
    delete unused['IN1-'];
    delete unused['DB1'];
    delete unused['IN1+'];
    delete unused['OUT1'];
    delete unused['AB1'];
    c.restoreFromComponents(aOldComponents);

    // create triangle OTA component
    c = new SC.Component('ota_triangle_5pin', name + '.B', value, 1 + 1, 10 + 1, 0, false);
    SC.components.item.push(c);
    // inverting, non-inverting, output
    SC.nets.addComponentPin(pin_net['IN2-'], c, c.pinByName('IN-'));
    SC.nets.addComponentPin(pin_net['DB2'], c, c.pinByName('DB'));
    SC.nets.addComponentPin(pin_net['IN2+'], c, c.pinByName('IN+'));
    SC.nets.addComponentPin(pin_net['OUT2'], c, c.pinByName('OUT'));
    SC.nets.addComponentPin(pin_net['AB2'], c, c.pinByName('IB'));
    delete unused['IN2-'];
    delete unused['DB2'];
    delete unused['IN2+'];
    delete unused['OUT2'];
    delete unused['AB2'];
    c.restoreFromComponents(aOldComponents);

    // output buffers
    c = new SC.Component('ota_buffer', name + '.C', value, 1 + 1, 10 + 1, 0, false);
    SC.components.item.push(c);
    // in out
    SC.nets.addComponentPin(pin_net['BI1'], c, c.pinByName('BI'));
    SC.nets.addComponentPin(pin_net['BO1'], c, c.pinByName('BO'));
    delete unused['BI1'];
    delete unused['BO1'];
    c.restoreFromComponents(aOldComponents);

    // output buffers
    c = new SC.Component('ota_buffer', name + '.D', value, 1 + 1, 10 + 1, 0, false);
    SC.components.item.push(c);
    // in out
    SC.nets.addComponentPin(pin_net['BI2'], c, c.pinByName('BI'));
    SC.nets.addComponentPin(pin_net['BO2'], c, c.pinByName('BO'));
    delete unused['BI2'];
    delete unused['BO2'];
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

