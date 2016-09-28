"use strict";
var request = require("request");
var _ = require("underscore");
var Q = require("q");
var baseUrl = "http://recette.{0}.mari-sncf.io/api/{1}/healthcheck";
var config = require("../config/config").config;
var logger = require("@archiciel/log");

function getHealthCheckByMS() {
    var defer = Q.defer();
    var urls = [];
    var environementList = config.environementList;
    var msList = config.msList;
    _.each(environementList, function (environementType, key) {
        baseUrl = environementType.baseUrl;
        _.each(environementType.env, function (environement) {
            _.each(msList, function (ms) {
                urls.push(
                    {
                        url: baseUrl.replace("{0}", environement).replace("{1}", ms),
                        ms: ms,
                        env: key + environement
                    });
            });
        });
    });
    var promises = [];
    _.each(urls, function (url) {
        promises.push(getHealthCheck(url));
    });
    Q.allSettled(promises).then(
        function (results) {
            var response = [];
            results.forEach(function (result) {
                if (result.state === "fulfilled") {
                    response.push(result.value);
                } else {
                    logger.warn("Erreur lors de la récupération des info de " + result.reason.ms + " sur " + result.reason.url);
                }
            });
            defer.resolve(response);
        },
        function (error) {
            logger.warn("[mpd][getHealthCheckByMS] ERROR : " + error);
            defer.reject({
                statusCode: 404,
                error: error
            });
        }
    ).catch(
        function (exception) {
            logger.warn("[mpd][getHealthCheckByMS] EXCEPTION : " + exception);
            defer.reject({
                statusCode: 500,
                error: exception
            });
        }
    );
    return defer.promise;
}

function getHealthCheck(url) {
    var defer = Q.defer();
    request.get(url.url, {
        'auth': {
            'bearer': '739556744566901d16c42390b81b5fc328169449'
        }
    }, function (error, httpRes, body) {
        var parseBody;
        try {
            parseBody = JSON.parse(body);
        }
        catch (ex) {
            defer.reject({
                ms: url.ms,
                env: url.env,
                url: url.url,
                statusCode: (httpRes ? httpRes.statusCode : 408),
                error: error,
                message: ex
            });
        }

        if (error || !httpRes || typeof parseBody !== "object") {
            defer.reject({
                ms: url.ms,
                env: url.env,
                url: url.url,
                statusCode: (httpRes ? httpRes.statusCode : 408),
                error: error,
                message: body
            });
        }
        else {
            var serviceMPD = _.find(parseBody.services,
                function (service) {
                    return service.serviceName === "MPD";
                }
            );
            var urlMPD;
            var versionMPD;
            var etoil;
            if (serviceMPD) {
                urlMPD = serviceMPD.url;
                urlMPD = urlMPD.split(".")[0];
                versionMPD = serviceMPD.version;
                etoil = serviceMPD.etoil;
            }
            var result = {
                ms: url.ms,
                env: url.env,
                version: parseBody.version,
                mpd: urlMPD,
                mpdVersion: versionMPD,
                etoil: etoil
            };
            defer.resolve(result);
        }
    });
    return defer.promise;
}

module.exports = {
    getHealthCheck: getHealthCheckByMS
};