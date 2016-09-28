"use strict";

var mpdModel = function (data, env) {
    if (data !== undefined) {
        this.environement = env;
        this.url = data.url || "N.A.";
        this.version = data.version || "N.A.";
    }
};

module.exports = mpdModel;