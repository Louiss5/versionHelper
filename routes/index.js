var express = require('express');
var router = express.Router();
var mpd = require("../src/mpd");
var _ = require("underscore");

/* GET home page. */
router.get('/', function (req, res, next) {
    mpd.getHealthCheck().then(
        function (value) {
            console.log(value);
            var tableVersion = [
                {
                    applicationName: "SUE",
                    DR1: "1.0.0",
                    DR2: "1.0.0",
                    DR3: "1.0.0",
                    DR4: "1.0.0",
                    DR5: "1.0.0",
                    DR6: "1.0.0"
                },
                {
                    applicationName: "Products-ms",
                    DR1: "1.0.0",
                    DR2: "1.0.0",
                    DR3: "1.0.0",
                    DR4: "1.0.0",
                    DR5: "1.0.0",
                    DR6: "1.0.0"
                },
                {
                    applicationName: "Itineraries-ms",
                    DR1: "1.0.0",
                    DR2: "1.0.0",
                    DR3: "1.0.0",
                    DR4: "1.0.0",
                    DR5: "1.0.0",
                    DR6: "1.0.0"
                },
                {
                    applicationName: "Orders-ms",
                    DR1: "1.0.0",
                    DR2: "1.0.0",
                    DR3: "1.0.0",
                    DR4: "1.0.0",
                    DR5: "1.0.0",
                    DR6: "1.0.0"
                },
                {
                    applicationName: "Site DR",
                    DR1: "1.0.0",
                    DR2: "1.0.0",
                    DR3: "1.0.0",
                    DR4: "1.0.0",
                    DR5: "1.0.0",
                    DR6: "1.0.0"
                },
                {
                    applicationName: "MPD",
                    DR1: "1.0.0",
                    DR2: "1.0.0",
                    DR3: "1.0.0",
                    DR4: "1.0.0",
                    DR5: "1.0.0",
                    DR6: "1.0.0"
                },
                {
                    applicationName: "Etoil",
                    DR1: "1.0.0",
                    DR2: "1.0.0",
                    DR3: "1.0.0",
                    DR4: "1.0.0",
                    DR5: "1.0.0",
                    DR6: "1.0.0"
                }
            ];
            res.render('index', {title: 'Vision des versions', version: tableVersion});
        }
    );
});

module.exports = router;
