"use strict";
var request = require("request");
var _ = require("underscore");
var Q = require("q");
var os = require("os");
var baseUrl = "http://recette.{0}.mari-sncf.io/api/{1}/healthcheck";

function getHealthCheckByMS() {
    var defer = Q.defer();
    var urls = [];
    var environementList = ["sue1", "sue2", "sue3", "sue4", "sue5", "sue6"];
    var msList = ["products", "itineraries", "orders"];
    _.each(environementList, function (environement) {
        _.each(msList, function (ms) {
            urls.push(
                {
                    url: baseUrl.replace("{0}", environement).replace("{1}", ms),
                    ms: ms,
                    env: environement
                });
        });
    });
    var promises = [];
    _.each(urls, function (url) {
        promises.push(getHealthCheck(url));
    });
    Q.allSettled(promises).then(
        function (results) {
            console.log("OK");
            var response = [];
            results.forEach(function (result) {
                if (result.state === "fulfilled") {
                    response.push(result.value);
                } else {
                    console.log(result.reason);
                }
            });
            defer.resolve(response);
        },
        function (error) {
            console.log("ERROR");
            defer.reject({
                statusCode: 404,
                error: error
            });
        }
    ).catch(
        function (exception) {
            console.log("EXCEPTION");
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
                statusCode: (httpRes ? httpRes.statusCode : 408),
                error: error,
                message: ex
            });
        }

        if (error || !httpRes || typeof parseBody !== "object") {
            defer.reject({
                ms: url.ms,
                env: url.env,
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
            var urlMPD = serviceMPD.url;
            urlMPD = urlMPD.split(".")[0];
            var versionMPD = serviceMPD.version;
            var etoil = serviceMPD.etoil;
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