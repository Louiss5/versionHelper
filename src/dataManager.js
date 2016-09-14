var Q = require("q");
var mpd = require("../src/mpd");
var dr = require("../src/siteDR");
var _ = require("underscore");
var cache = require("@archiciel/cache");
var logger = require("@archiciel/log");
var config = require("../config/config").config;
var dataNOSQL = require("@archiciel/data-nosql");

var expireCache = 0.25 * 60; // 10 minutes (en secondes)

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
            logger.debug(value);
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
                result.mpd[microService.env] = result[microService.env] !== undefined ?
                    result.mpd[microService.env].url === microService.mpd ?
                    {url: microService.mpd, version: microService.mpdVersion} :
                    {url: "N.A.", version: "N.A."} :
                {url: microService.mpd, version: microService.mpdVersion};
                result.etoil[microService.env] = result[microService.env] !== undefined ?
                    result.etoil[microService.env] === microService.etoil ?
                        microService.etoil :
                        "N.A." :
                    microService.etoil;
            });

            var tableVersion = [
                {
                    applicationName: "SUE/BEA",
                    DR1: "N.A.",
                    DR2: "N.A.",
                    DR3: "N.A.",
                    DR4: "N.A.",
                    DR5: "N.A.",
                    DR6: "N.A."
                },
                {
                    applicationName: "Products-ms",
                    DR1: result.products.sue,
                    DR2: result.products.sue2,
                    DR3: result.products.sue3,
                    DR4: result.products.sue4,
                    DR5: result.products.sue5,
                    DR6: result.products.sue6
                },
                {
                    applicationName: "Itineraries-ms",
                    DR1: result.itineraries.sue,
                    DR2: result.itineraries.sue2,
                    DR3: result.itineraries.sue3,
                    DR4: result.itineraries.sue4,
                    DR5: result.itineraries.sue5,
                    DR6: result.itineraries.sue6
                },
                {
                    applicationName: "Orders-ms",
                    DR1: result.orders.sue,
                    DR2: result.orders.sue2,
                    DR3: result.orders.sue3,
                    DR4: result.orders.sue4,
                    DR5: result.orders.sue5,
                    DR6: result.orders.sue6
                },
                {
                    applicationName: "Site DR",
                    DR1: result.dr.dr,
                    DR2: result.dr.dr2,
                    DR3: result.dr.dr3,
                    DR4: result.dr.dr4,
                    DR5: result.dr.dr5,
                    DR6: result.dr.dr6
                },
                {
                    applicationName: "MPD",
                    DR1: result.mpd.sue ? result.mpd.sue.url + " (" + result.mpd.sue.version + ")" : "N.A.",
                    DR2: result.mpd.sue2 ? result.mpd.sue2.url + " (" + result.mpd.sue2.version + ")" : "N.A.",
                    DR3: result.mpd.sue3 ? result.mpd.sue3.url + " (" + result.mpd.sue3.version + ")" : "N.A.",
                    DR4: result.mpd.sue4 ? result.mpd.sue4.url + " (" + result.mpd.sue4.version + ")" : "N.A.",
                    DR5: result.mpd.sue5 ? result.mpd.sue5.url + " (" + result.mpd.sue5.version + ")" : "N.A.",
                    DR6: result.mpd.sue6 ? result.mpd.sue6.url + " (" + result.mpd.sue6.version + ")" : "N.A."
                },
                {
                    applicationName: "Etoil",
                    DR1: result.etoil.sue,
                    DR2: result.etoil.sue2,
                    DR3: result.etoil.sue3,
                    DR4: result.etoil.sue4,
                    DR5: result.etoil.sue5,
                    DR6: result.etoil.sue6
                }
            ];
            var noSqlData = {
                data: JSON.stringify(tableVersion),
                date: Date.now()
            };
            dataNOSQL.create("versionHelper", config.schema, noSqlData);
            cache.write("tableVersionData", JSON.stringify(tableVersion), expireCache);
            if (defer) {
                defer.resolve(tableVersion);
            }
        }
    );
}

function readDataDb (defer) {
    dataNOSQL.read("versionHelper", config.schema, {}, {sort: '-date'}).then(
        function (value) {
            logger.debug("[index][getTableVersion] Retour de dataNOSQL.read");
            if (Array.isArray(value) && value[0]._doc.hasOwnProperty("data")) {
                defer.resolve(JSON.parse(value[0]._doc.data));
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