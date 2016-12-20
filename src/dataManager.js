var Q = require("q");
var mpd = require("../src/mpd");
var dr = require("../src/siteDR");
var _ = require("underscore");
var cache = require("@archiciel/cache");
var logger = require("@archiciel/log");
var dataNOSQL = require("@archiciel/data-nosql");
var tableVersionModel = require("../model/tableVersionModel");
var utils = require("./utils");

var expireCache = 0.1 * 60; // 10 minutes (en secondes)

function getTableVersion() {
    var defer = Q.defer();
    cache.read("tableVersionData").then(
        function (data) {
            logger.debug("[dataManager][getTableVersion] Retour de cache");
            if (data) {
                logger.debug("[dataManager][getTableVersion] Clé trouvée");
                try {
                    var parsedData = utils.parseJSON(data);
                    parsedData.data = utils.parseJSON(parsedData.data);
                    defer.resolve(parsedData);
                }
                catch (exception) {
                    logger.debug("[dataManager][getTableVersion] Catch, erreur lors du parse de la value en cache");
                    readDataDb(defer);
                }
            }
            else {
                logger.debug("[dataManager][getTableVersion] Aucune clé correspondante");
                readDataDb(defer);
            }
        },
        function () {
            logger.debug("[dataManager][getTableVersion] Reject de cache");
            readDataDb(defer);
        }
    ).catch(
        function (exception) {
            logger.debug("[dataManager][getTableVersion] Erreur dans cache read : " + exception);
            readDataDb(defer);
        }
    );
    return defer.promise;
}

/**
 * Récupération des données directement par appel des url.
 */
function getData() {
    var defer = Q.defer();
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

            try {
                var tableVersion = new tableVersionModel(result);
            }
            catch (reason) {
                logger.error(reason);
                throw new Error("Erreur lors de la formation du model, ajout en base impossible.")
            }
            var noSqlData = {
                data: tableVersion,
                date: Date.now()
            };
            readDataDb().then(
                function (value) {
                    logger.info("[dataManager][getData] Retour de readDataDb");
                    noSqlData.data.Deploy = value.data.Deploy;
                    dataNOSQL.insertCollection("versionHelper", noSqlData);
                    defer.resolve(noSqlData);
                },
                function (reason) {
                    logger.info(reason);
                    dataNOSQL.insertCollection("versionHelper", noSqlData);
                    defer.resolve(noSqlData);
                }
            );
            cache.write("tableVersionData", utils.stringifyJSON(noSqlData), expireCache);
        },
        function (reason){
            logger.warn("[dataManager][getData] Erreur : " + utils.stringifyJSON(reason));
            defer.reject(reason);
        }
    ).catch(
        function (exception) {
            logger.warn("[dataManager][getData] Exception : " + utils.stringifyJSON(exception));
            defer.reject(exception);
        }
    );
    return defer.promise;
}

function updateDeployInformation(data) {
    var defer = Q.defer();
    readDataDb().then(
        function (value) {
            var date = value.date;
            dataNOSQL.updateCollection("versionHelper", {$set: {"data.Deploy": data}}, {date: date}, {multi: true}).then(
                function () {
                    logger.info("[dataManager][updateCollection] Update de la date " + date + " OK");
                    cache.remove("tableVersionData");
                    defer.resolve("Update OK");
                },
                function (reason) {
                    logger.warn("[dataManager][updateDeployInformation] Erreur dans updateCollection : " + reason);
                    defer.reject("Erreur dans updateCollection : " + reason);
                }
            ).catch(
                function (exception) {
                    logger.error("[dataManager][updateDeployInformation] Exception dans updateCollection : " + exception);
                    defer.reject("Exception dans updateCollection : " + exception);
                }
            );
        },
        function (reason) {
            logger.warn("[dataManager][updateDeployInformation] Erreur dans readDataDb : " + reason);
            defer.reject("Erreur dans readDataDb : " + reason);
        }
    ).catch(
        function (exception) {
            logger.error("[dataManager][updateDeployInformation] Exception dans readDataDb : " + exception);
            defer.reject("Exception dans readDataDb : " + exception);
        }
    );
    return defer.promise;
}

/**
 * Récupération des données de version en base.
 * @param defer Promesse à retourner.
 */
function readDataDb(defer) {
    defer = defer || Q.defer();
    dataNOSQL.readCollection("versionHelper", {}, {sort: {date: -1}, limit: 1}).then(
        function (value) {
            logger.debug("[dataManager][readDataDb] Retour de dataNOSQL.read");
            if (Array.isArray(value) && value[0]) {
                defer.resolve(value[0]);
            }
            defer.reject("Erreur");
        },
        function (reason) {
            logger.warn("[dataManager][readDataDb] Erreur : " + reason);
            defer.reject("Erreur : " + reason);
        }
    ).catch(
        function (exception) {
            logger.error("[dataManager][readDataDb] Exception : " + exception);
            defer.reject("Exception : " + exception);
        }
    );
    return defer.promise;
}

module.exports = {
    updateDeployInformation: updateDeployInformation,
    getTableVersion: getTableVersion,
    getData: getData
};