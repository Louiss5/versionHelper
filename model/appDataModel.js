"use strict";
var config = require("../config/config").config;

var appDataModel = function (data, appName) {
    if (data !== undefined) {
        this.appName = appName;
        this.DevLot1 = data.devABC || "N.A.";
        this.DevLot2 = data.devXYZ || "N.A.";
        this.DR1 = data.dr || data.drsue || "N.A.";
        this.DR2 = data.dr2 || data.drsue2 || "N.A.";
        this.DR3 = data.dr3 || data.drsue3 || "N.A.";
        this.DR4 = data.dr4 || data.drsue4 || "N.A.";
        this.DR5 = data.dr5 || data.drsue5 || "N.A.";
        this.DR6 = data.dr6 || data.drsue6 || "N.A.";
    }
};

module.exports = appDataModel;