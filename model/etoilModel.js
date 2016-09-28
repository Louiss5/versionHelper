"use strict";

var etoilModel = function (data, env) {
    if (data !== undefined) {
        this.environement = env;
        this.value = typeof data === "string" ? data : "N.A.";
        this.isDifferent = data.isDifferent || false;
    }
};

module.exports = etoilModel;