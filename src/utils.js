"use strict";

// Modules MARI
var logger = require("@archiciel/log");

/**
 * Helper de parsage du body.
 * @param data
 */
function parseJSON(data) {
    var result = "";
    try {
        if (data) {
            if (typeof data === "string") {
                result = JSON.parse(data);
            } else if (typeof data === "object") {
                result = data;
            }
        }
    } catch (ex) {
        logger.error("Erreur rencontrée lors parse du string : " + JSON.stringify(data) + ", Exception : " + ex + ", stacktrace : " + ex.stack);
    }
    return result;
}

/**
 * Helper de stringification du body.
 * @param json
 */
function stringifyJSON(json) {
    var result = "";
    try {
        if (json) {
            if (typeof json === "string") {
                result = json;
            } else {
                result = JSON.stringify(json);
            }
        }
    } catch (ex) {
        logger.error("Erreur rencontrée lors de la stringification : " + json + ", Exception : " + ex + ", stacktrace : " + ex.stack);
    }
    return result;
}

module.exports = {
    stringifyJSON: stringifyJSON,
    parseJSON: parseJSON
};