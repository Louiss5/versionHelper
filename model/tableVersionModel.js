"use strict";
var _ = require("underscore");
var appDataModel = require("./appDataModel");
var mpdModel = require("./mpdModel");
var etoilModel = require("./etoilModel");
var deployModel = require("./deployModel");
var config = require("../config/config").config;
var envList = config.environementDev.concat(config.environementCloud);

var tableVersionModel = function (data) {
    this.tableVersion = [];
    this.MPD = [];
    this.Etoil = [];
    this.Deploy = [];
    var that = this;
    if (data !== undefined) {
        this.tableVersion.push(new appDataModel(data.suebea || {}, "Sue / Bea"));
        this.tableVersion.push(new appDataModel(data.products || {}, "Products"));
        this.tableVersion.push(new appDataModel(data.itineraries || {}, "Itineraries"));
        this.tableVersion.push(new appDataModel(data.orders || {}, "Orders"));
        this.tableVersion.push(new appDataModel(data.accounts || {}, "Accounts"));
        this.tableVersion.push(new appDataModel(data.dr || {}, "SiteDR"));
        _.each(envList, function (env) {
            var mpd, etoil, deploy;
            mpd = data.mpd ? data.mpd[env] || {} : {};
            etoil = data.etoil ? data.etoil[env] || {} : {};
            deploy = data.deploy ? data.deploy[env] || {} : {};
            that.MPD.push(new mpdModel(mpd, env));
            that.Etoil.push(new etoilModel(etoil, env));
            that.Deploy.push(new deployModel(deploy, env));
        })
    }
};

module.exports = tableVersionModel;