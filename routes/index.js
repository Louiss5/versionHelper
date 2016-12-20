var express = require('express');
var router = express.Router();
var dataManager = require("../src/dataManager");
var logger = require("@archiciel/log");
var config = require("../config/config").config;
var utils = require("../src/utils");

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', {
        title: 'Vision des versions',
        mpdPlateform: config.mpdPlateform
    });
});

/* GET data. */
router.get('/data', function (req, res) {
    dataManager.getTableVersion().then(
        function (tableVersion) {
            tableVersion.message = "Rafraichissement des données effectuées";
            res.json(tableVersion);
        },
        function (error) {
            res.status(500).send(error);
        }
    ).catch(
        function (exception) {
            logger.error("[index][updateDeployInformation] Exception : " + exception);
            res.status(500).end(exception);
        }
    );
});

/* GET data. */
router.get('/forceUpdate', function (req, res) {
    dataManager.getData().then(
        function (tableVersion) {
            tableVersion.message = "Récupération et mise à jour des données effectuées";
            res.json(tableVersion);
        },
        function (reason) {
            logger.error("[index][forceUpdate] Error : " + exception);
            res.status(500).end(reason);
        }
    ).catch(
        function (exception) {
            logger.error("[index][forceUpdate] Exception : " + exception);
            res.status(500).end(exception);
        }
    );
});

/* POST deploy. */
router.post('/deployDate', function (req, res) {
    logger.debug("[index][deployDate] req : " + utils.stringifyJSON(req.body));
    var body = req.body;
    dataManager.updateDeployInformation(body).then(
        function (data) {
            res.status(200).json({"message":"Enregistrement efféctué"});
        },
        function (reason) {
            logger.warn("[index][updateDeployInformation] Error : " + reason);
            res.status(500).end(reason);
        }
    ).catch(
        function (exception) {
            logger.error("[index][updateDeployInformation] Exception : " + exception);
            res.status(500).end(exception);
        }
    );
});

module.exports = router;