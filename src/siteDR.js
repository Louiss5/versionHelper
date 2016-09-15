"use strict";
var Q = require("q");
var _ = require("underscore");
var himalaya = require("himalaya");
var request = require("request");
var config = require("../config/config").config;
var baseUrl = "http://recette.{0}.mari-sncf.io/monitoring";

function getVersionDr() {
    var defer = Q.defer();
    var environementList = config.environementDRList;
    var urls = [];
    _.each(environementList, function (environement) {
        urls.push(
            {
                url: baseUrl.replace("{0}", environement),
                env: environement
            }
        );
    });
    var promises = [];
    _.each(urls, function (url) {
        promises.push(getVersion(url));
    });
    Q.allSettled(promises).then(
        function (results) {
            var response = [];
            results.forEach(function (result) {
                if (result.state === "fulfilled") {
                    var version = toHTML(result.value.body);
                    response.push({
                        env: result.value.env,
                        version: version.split(" ")[1]
                    });
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
            console.log("EXCEPTION : " + exception);
            defer.reject({
                statusCode: 500,
                error: exception
            });
        }
    );
    return defer.promise;
}

function getVersion(url) {
    var defer = Q.defer();
    request.get(url.url,
        function (error, httpRes, body) {
            defer.resolve({
                env: url.env,
                body: body
            });
        });
    return defer.promise;
}

function toHTML(html) {
    var result;
    var json = himalaya.parse(html);
    var htmlTag = _.find(json, function (elmt) {
        return elmt.tagName === "html";
    });
    var body = _.find(htmlTag.children, function (elmt) {
        return elmt.tagName === "body";
    });
    var h3 = _.find(body.children, function (elmt) {
        return elmt.tagName === "h3";
    });
    result = _.find(h3.children, function (elmt) {
        return elmt.type === "Text";
    });
    return result.content;
}

module.exports = {
    getVersionDr: getVersionDr
};