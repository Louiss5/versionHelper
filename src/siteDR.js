"use strict";
var config = require("../config/config.json");
var baseUrl = "http://recette.{0}.mari-sncf.io/monitoring";

function getVersionDr() {
    var environementList = config.environementDRList;
    var urls = [];
    _.each(environementList, function (environement) {
        urls.push(
            {
                url: baseUrl.replace("{0}", environement),
                env: environement
            });
    });
    return {}
}

function getVersion(url) {

}

module.exports = {
    getVersionDr: getVersionDr
};