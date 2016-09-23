var Q = require("q");
var mpd = require("../src/mpd");
var dr = require("../src/siteDR");
var _ = require("underscore");
var cache = require("@archiciel/cache");
var logger = require("@archiciel/log");
var config = require("../config/config").config;
var dataNOSQL = require("@archiciel/data-nosql");

var expireCache = 10 * 60; // 10 minutes (en secondes)

function getTableVersion() {
    var defer = Q.defer();
    cache.read("tableVersionData").then(
        function (data) {
            logger.debug("[index][getTableVersion] Retour de cache");
            if (data) {
                logger.debug("[index][getTableVersion] Clé trouvée");
                try {
                    var parsedData = JSON.parse(data);
                    defer.resolve(parsedData);
                }
                catch (exception) {
                    logger.debug("[index][getTableVersion] Catch, erreur lors du parse de la value en cache");
                    readDataDb(defer);
                }
            }
            else {
                logger.debug("[index][getTableVersion] Aucune clé correspondante");
                readDataDb(defer);
            }
        },
        function () {
            logger.debug("[index][getTableVersion] Reject de cache");
            readDataDb(defer);
        }
    ).catch(
        function (exception) {
            logger.debug("[index][getTableVersion] Erreur dans cache read : " + exception);
            readDataDb(defer);
        }
    );
    return defer.promise;
}

function getData(defer) {
    Q.all([dr.getVersionDr(), mpd.getHealthCheck()]).then(
        function (value) {
            var result = {
                dr: {},
                mpd: {},
                etoil: {}
            };

            value[0].forEach(function (dr) {
                result.dr[dr.env] = dr.version;
            });

            // Récupération des versions micro-services et mpd
            value[1].forEach(function (microService) {

                result[microService.ms] = result[microService.ms] !== undefined ? result[microService.ms] : {};

                result[microService.ms][microService.env] = microService.version;

                if (result.mpd[microService.env]) {
                    if (result.mpd[microService.env].url === microService.mpd) {
                        result.mpd[microService.env] = {
                            url: microService.mpd,
                            version: microService.mpdVersion || result.mpd[microService.env].version
                        };
                    }
                    else {
                        result.mpd[microService.env] = {isDifferent: true};
                    }
                }
                else {
                    result.mpd[microService.env] = {url: microService.mpd, version: microService.mpdVersion};
                }

                if (result.etoil[microService.env] && result.etoil[microService.env] !== "default") {
                    if (result.etoil[microService.env] === microService.etoil) {
                        result.etoil[microService.env] = microService.etoil;
                    }
                    else {
                        result.etoil[microService.env] = {isDifferent: true};
                    }
                }
                else {
                    result.etoil[microService.env] = microService.etoil || "default";
                }
            });

            var tableVersion = {
                "SUE/BEA": {
                    DevLot1: "N.A.",
                    DevLot2: "N.A.",
                    DR1: "N.A.",
                    DR2: "N.A.",
                    DR3: "N.A.",
                    DR4: "N.A.",
                    DR5: "N.A.",
                    DR6: "N.A."
                }
                ,
                "Products-ms": {
                    DevLot1: result.products.dev,
                    DevLot2: result.products.devAS2,
                    DR1: result.products.drsue,
                    DR2: result.products.drsue2,
                    DR3: result.products.drsue3,
                    DR4: result.products.drsue4,
                    DR5: result.products.drsue5,
                    DR6: result.products.drsue6
                }
                ,
                "Itineraries-ms": {
                    DevLot1: result.itineraries.dev,
                    DevLot2: result.itineraries.devAS2,
                    DR1: result.itineraries.drsue,
                    DR2: result.itineraries.drsue2,
                    DR3: result.itineraries.drsue3,
                    DR4: result.itineraries.drsue4,
                    DR5: result.itineraries.drsue5,
                    DR6: result.itineraries.drsue6
                }
                ,
                "Orders-ms": {
                    DevLot1: result.orders.dev,
                    DevLot2: result.orders.devAS2,
                    DR1: result.orders.drsue,
                    DR2: result.orders.drsue2,
                    DR3: result.orders.drsue3,
                    DR4: result.orders.drsue4,
                    DR5: result.orders.drsue5,
                    DR6: result.orders.drsue6
                }
                ,
                "Site DR": {
                    DevLot1: "N.A.",
                    DevLot2: "N.A.",
                    DR1: result.dr.dr,
                    DR2: result.dr.dr2,
                    DR3: result.dr.dr3,
                    DR4: result.dr.dr4,
                    DR5: result.dr.dr5,
                    DR6: result.dr.dr6
                }
                ,
                "MPD": {
                    DevLot1: result.mpd.dev || "N.A.",
                    DevLot2: result.mpd.devAS2 || "N.A.",
                    DR1: result.mpd.drsue || "N.A.",
                    DR2: result.mpd.drsue2 || "N.A.",
                    DR3: result.mpd.drsue3 || "N.A.",
                    DR4: result.mpd.drsue4 || "N.A.",
                    DR5: result.mpd.drsue5 || "N.A.",
                    DR6: result.mpd.drsue6 || "N.A."
                }
                ,
                "Etoil": {
                    DevLot1: result.etoil.dev,
                    DevLot2: result.etoil.devAS2,
                    DR1: result.etoil.drsue,
                    DR2: result.etoil.drsue2,
                    DR3: result.etoil.drsue3,
                    DR4: result.etoil.drsue4,
                    DR5: result.etoil.drsue5,
                    DR6: result.etoil.drsue6
                }
            };
            var noSqlData = {
                data: JSON.stringify(tableVersion),
                date: Date.now()
            };
            dataNOSQL.create("versionHelper", config.schema, noSqlData);
            cache.write("tableVersionData", JSON.stringify(noSqlData), expireCache);
            if (defer) {
                defer.resolve(tableVersion);
            }
        }
    )
    ;
}

function readDataDb(defer) {
    dataNOSQL.read("versionHelper", config.schema, {}, {sort: '-date', limit: 1}).then(
        function (value) {
            logger.debug("[index][readDataDb] Retour de dataNOSQL.read");
            console.log(value);
            if (Array.isArray(value) && value[0]._doc.hasOwnProperty("data")) {
                try {
                    var jsonData = {
                        "data": JSON.parse(value[0]._doc.data),
                        "date": value[0]._doc.date
                    };
                    defer.resolve(jsonData);
                }
                catch (exception) {
                    logger.debug("[index][readDataDb] Exception JSON.parse : " + exception);
                }
            }
            defer.reject("Erreur");
        },
        function (reason) {
            defer.reject("Erreur : " + reason);
        }
    );
}

module.exports = {
    getTableVersion: getTableVersion,
    getData: getData
};