var express = require('express');
var router = express.Router();
var dataManager = require("../src/dataManager");

/* GET home page. */
router.get('/', function (req, res) {
    dataManager.getTableVersion().then(
        function (tableVersion) {
            res.render('index', {title: 'Vision des versions', version: tableVersion});
        },
        function (error) {
            res.render('error', {message: 'Vision des versions', error: {"status": error}});
        }
    );
});

/* GET data. */
router.get('/data', function (req, res) {
    dataManager.getTableVersion().then(
        function (tableVersion) {
            res.json({version: tableVersion});
        },
        function (error) {
            res.status(500).send(error);
        }
    );
});

module.exports = router;
