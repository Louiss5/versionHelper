/* eslint-disable no-console */
(function () {
    "use strict";
    var Q = require("q");
    var logger = require("@archiciel/log");

    logger.init().then(
        function () {
            Q.all([require("../config/config").init(), require("@archiciel/cache").init(), require("@archiciel/data-nosql").init()])
                .then(function (value) {
                    var cronManager = require("../src/cronManager");
                    var dataManager = require("../src/dataManager");
                    dataManager.getData();
                    cronManager.createJob("versionTask", value[0].refreshPattern, dataManager.getData).then(
                        function () {
                            cronManager.startTask("versionTask");
                            logger.info("ordonnanceur démarré");
                        },
                        function (error) {
                            logger.warn("Erreur lors de la création de la tache", error);
                        }
                    ).catch(
                        function (error) {
                            logger.warn("catch cronManager.createJob", error);
                        }
                    );
                    var app = require('../app');
                    var debug = require('debug')('versionHelper:server');
                    var http = require('http');

                    /**
                     * Get port from environment and store in Express.
                     */

                    var port = normalizePort('3062');
                    app.set('port', port);

                    /**
                     * Create HTTP server.
                     */

                    var server = http.createServer(app);

                    /**
                     * Listen on provided port, on all network interfaces.
                     */

                    server.listen(port);
                    logger.debug("Serveur démarré sur le port : " + port);
                    server.on('error', onError);
                    server.on('listening', onListening);

                    /**
                     * Normalize a port into a number, string, or false.
                     */

                    function normalizePort(val) {
                        var port = parseInt(val, 10);

                        if (isNaN(port)) {
                            // named pipe
                            return val;
                        }

                        if (port >= 0) {
                            // port number
                            return port;
                        }

                        return false;
                    }

                    /**
                     * Event listener for HTTP server "error" event.
                     */

                    function onError(error) {
                        if (error.syscall !== 'listen') {
                            throw error;
                        }

                        var bind = typeof port === 'string'
                            ? 'Pipe ' + port
                            : 'Port ' + port;

                        // handle specific listen errors with friendly messages
                        switch (error.code) {
                            case 'EACCES':
                                logger.error(bind + ' requires elevated privileges');
                                process.exit(1);
                                break;
                            case 'EADDRINUSE':
                                logger.error(bind + ' is already in use');
                                process.exit(1);
                                break;
                            default:
                                throw error;
                        }
                    }

                    /**
                     * Event listener for HTTP server "listening" event.
                     */

                    function onListening() {
                        var addr = server.address();
                        var bind = typeof addr === 'string'
                            ? 'pipe ' + addr
                            : 'port ' + addr.port;
                        debug('Listening on ' + bind);
                    }
                }, function (error) {
                    logger.error("[init] " + error);
                }).catch(function (exception) {
                    logger.error("[init] exception : " + exception + ", stacktrace : " + exception.stack);
                });
        },
        function (error) {
            //si une erreur est survenue
            console.log(error);
        }
    ).catch(
        function (exception) {
            console.log(exception);
        }
    );
})();
