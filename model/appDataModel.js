"use strict";
var config = require("../config/config").config;

var appDataModel = function (data, appName) {
    if (data !== undefined) {
        this.appName = appName;
        this.DRD = data.DRD || "N.A.";
        this.PAC = data.PAC || "N.A.";
        this.INT = data.INT || "N.A.";
        this.DR1 = data.dr || data.sue || "N.A.";
        this.DR2 = data.dr2 || data.sue2 || "N.A.";
        this.DR3 = data.dr3 || data.sue3 || "N.A.";
        this.DR4 = data.dr4 || data.sue4 || "N.A.";
        this.DR5 = data.dr5 || data.sue5 || "N.A.";
        this.DR6 = data.dr6 || data.sue6 || "N.A.";
    }
};

module.exports = appDataModel;