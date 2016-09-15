var express = require('express');
var router = express.Router();
var dataManager = require("../src/dataManager");
var config = require("../config/config").config;

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

module.exports = router;
