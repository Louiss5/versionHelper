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
            res.json(tableVersion);
        },
        function (error) {
            res.status(500).send(error);
        }
    );
});

/* GET data. */
router.get('/forceUpdate', function (req, res) {
    dataManager.getData().then(
        function (tableVersion) {
            res.json(tableVersion);
        },
        function (reason) {
            res.status(500).end(reason);
        }
    );
});

/* POST deploy. */
router.post('/deployDate', function (req, res) {
    var body = req.body;
    dataManager.updateDeployInformation(body).then(
        function (data) {
            res.status(200).end(data);
        },
        function (reason) {
            res.status(500).end(reason);
        }
    )
});

module.exports = router;