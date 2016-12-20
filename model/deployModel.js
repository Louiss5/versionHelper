"use strict";

var deployModel = function (data, env) {
    if (data !== undefined) {
        this.environement = env;
        this.date = data.date || "N.A.";
        this.lot = data.lot || "N.A.";
    }
};

module.exports = deployModel;