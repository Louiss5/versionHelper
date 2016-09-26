"use strict";
var appDataModel = require("./appDataModel");

var tableVersionModel = function (data) {
    if (data !== undefined) {
        this.SueBea = new appDataModel(data.suebea || {});
        this.Products = new appDataModel(data.products || {});
        this.Itineraries = new appDataModel(data.itineraries || {});
        this.Orders = new appDataModel(data.orders || {});
        this.SiteDR = new appDataModel(data.dr || {});
        this.MPD = new appDataModel(data.mpd || {});
        this.Etoil = new appDataModel(data.etoil || {});
        this.DeployDate = new appDataModel(data.deployDate || {});
        this.Lot = new appDataModel(data.lot || {});
    }
};

module.exports = tableVersionModel;