"use strict";
var appDataModel = require("./appDataModel");
var mpdModel = require("./mpdModel");
var etoilModel = require("./etoilModel");
var deployModel = require("./deployModel");
var config = require("../config/config").config;

var tableVersionModel = function (data) {
    var env;
    this.tableVersion = [];
    this.MPD = [];
    this.Etoil = [];
    this.Deploy = [];
    if (data !== undefined) {
        this.tableVersion.push(new appDataModel(data.suebea || {}, "Sue / Bea"));
        this.tableVersion.push(new appDataModel(data.products || {}, "Products"));
        this.tableVersion.push(new appDataModel(data.itineraries || {}, "Itineraries"));
        this.tableVersion.push(new appDataModel(data.orders || {}, "Orders"));
        this.tableVersion.push(new appDataModel(data.accounts || {}, "Accounts"));
        this.tableVersion.push(new appDataModel(data.dr || {}, "SiteDR"));
        for (env in config.tableEnv) {
            var mpd, etoil, deploy;
            if (config.tableEnv.hasOwnProperty(env)) {
                mpd = data.mpd ? data.mpd[config.tableEnv[env]] || {} : {};
                etoil = data.etoil ? data.etoil[config.tableEnv[env]] || {} : {};
                deploy = data.deploy ? data.deploy[config.tableEnv[env]] || {} : {};
                this.MPD.push(new mpdModel(mpd, config.tableEnv[env]));
                this.Etoil.push(new etoilModel(etoil, config.tableEnv[env]));
                this.Deploy.push(new deployModel(deploy, config.tableEnv[env]));
            }
        }
    }
};

module.exports = tableVersionModel;