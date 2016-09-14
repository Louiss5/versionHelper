"use strict";

var Q = require("q");
var configurator = require("@archiciel/configurator");

module.exports.init = function init() {
    var deferred = Q.defer();
    if (process.env.npm_package_name) {
        configurator.getConfig("versionHelper")
            .then(function (value) {
                module.exports.config = value;
                deferred.resolve(value);
            }, function (reason) {
                deferred.reject(reason);
            }).catch(function (exception) {
            deferred.reject(exception);
        });
    } else {
        deferred.reject("Le nom de l\'application n\'a pu être récupéré");
    }
    return deferred.promise;
};
