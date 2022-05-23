// Generate netlist from components
"use strict";
// globals: document, window

var SC = window.SC || {};

SC.netlist = function () {
    // Generate netlist from components
    var i, pots = {}, connectors = {}, n, pn, ps, pw, pe,
        missing = [], netlist = [], ground_net,
        unique = {}, errors = [], spst = {}, spdt = {}, dpdt = {};
    // components
    for (i = 0; i < SC.components.item.length; i++) {
        if (!SC.components.item[i].toNetlist) {
            console.log(SC.components.item[i]);
            throw "Component has no toNetlist() " + SC.components.item[i].name;
        }
        n = SC.components.item[i].toNetlist();
        if (n) {
            netlist.push(n);
        }
    }
    // all connectors
    for (i = 0; i < SC.components.item.length; i++) {
        // ground
        if (SC.components.item[i].name === 'Ground') {
            ground_net = SC.components.item[i].nets()[0];
        }
        // general connector
        if (SC.components.item[i] instanceof SC.Connector || SC.components.item[i] instanceof SC.ConnectorBattery) {
            connectors[SC.components.item[i].name] = SC.components.item[i].nets()[0];
        }
        // pots
        if (SC.components.item[i] instanceof SC.ConnectorPot) {
            n = SC.components.item[i].name;
            ps = SC.components.item[i].pot_start;
            pw = SC.components.item[i].pot_wiper;
            pe = SC.components.item[i].pot_end;
            pn = SC.components.item[i].nets()[0];
            pots[n] = pots[n] || {pot_start: -1, pot_wiper: -1, pot_end: -1, value: 0};
            if (ps) {
                pots[n].pot_start = pn;
                pots[n].value = pots[n].value || SC.components.item[i].value;
            }
            if (pw) {
                pots[n].pot_wiper = pn;
                pots[n].value = pots[n].value || SC.components.item[i].value;
            }
            if (pe) {
                pots[n].pot_end = pn;
                pots[n].value = pots[n].value || SC.components.item[i].value;
            }
        }
        // SPST switches
        if (SC.components.item[i] instanceof SC.ConnectorSwitchSPST) {
            n = SC.components.item[i].name;
            spst[n] = spst[n] || {};
            spst[n][SC.components.item[i].pin] = SC.components.item[i].nets()[0];
        }
        // SPDT switches
        if (SC.components.item[i] instanceof SC.ConnectorSwitchSPDT) {
            n = SC.components.item[i].name;
            spdt[n] = spdt[n] || {};
            spdt[n][SC.components.item[i].pin] = SC.components.item[i].nets()[0];
        }
        // DPDT switches
        if (SC.components.item[i] instanceof SC.ConnectorSwitchDPDT) {
            n = SC.components.item[i].name;
            dpdt[n] = dpdt[n] || {};
            dpdt[n][SC.components.item[i].pin] = SC.components.item[i].nets()[0];
        }
    }
    // pots
    for (n in pots) {
        if (pots.hasOwnProperty(n)) {
            netlist.push({type: 'potentiometer', name: n, value: pots[n].value, nets: [pots[n].pot_start, pots[n].pot_wiper, pots[n].pot_end]});
        }
    }
    // spst
    for (n in spst) {
        if (spst.hasOwnProperty(n)) {
            netlist.push({type: 'spst', name: n, nets: [spst[n][1], spst[n][2]]});
        }
    }
    // spdt
    for (n in spdt) {
        if (spdt.hasOwnProperty(n)) {
            netlist.push({type: 'spdt', name: n, nets: [spdt[n][1], spdt[n][2], spdt[n][3]]});
        }
    }
    // dpdt
    for (n in dpdt) {
        if (dpdt.hasOwnProperty(n)) {
            netlist.push({type: SC.components.findByName(n).schematic, name: n, nets: [dpdt[n][1], dpdt[n][2], dpdt[n][3], dpdt[n][4], dpdt[n][5], dpdt[n][6]]});
        }
    }
    // Find missing connectors
    if (!connectors.Input) {
        missing.push('Input');
    }
    if (!connectors.Output) {
        missing.push('Output');
    }
    if (!connectors.Ground) {
        missing.push('Ground');
    }
    if (!connectors.U1 && !connectors.Battery) {
        missing.push('U1 or Battery');
    }
    if (missing.length > 0) {
        console.warn('Missing connectors: ' + missing.join(', '));
    }
    // check for duplicate names
    for (i = 0; i < netlist.length; i++) {
        if (unique[netlist[i].name]) {
            errors.push('Name "' + netlist[i].name + '" is not unique (use e.g. "' + netlist[i].name + '" and "' + netlist[i].name + '2")!');
        }
        unique[netlist[i].name] = 1;
    }
    return {
        netlist: netlist,
        pots: pots,
        spst: spst,
        spdt: spdt,
        dpdt: dpdt,
        connectors: connectors,
        missing: missing,
        errors: errors,
        ground: ground_net
    };
};

