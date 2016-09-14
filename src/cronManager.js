"use strict";
var CronJob = require("cron").CronJob;
var CronManager = require("cron-job-manager");
var scheduler = new CronManager();
var logger = require("@archiciel/log");
var Q = require("q");

/**
 * Méthode de création d'un job.
 * @param taskName Nom de la tache.
 * @param cronPattern Pattern de périodicité (sous la forme d'un pattern Cron ou d'une date).
 * @param taskmethod La méthode appellée.
 */
function createJob(taskName, cronPattern, taskmethod) {
    var deferred = Q.defer();
    if (taskName && cronPattern && taskmethod && checkCronPattern(cronPattern)) {
        scheduler.add(taskName, cronPattern, taskmethod);

        logger.info("Tache crée : " + taskName + " - cronPattern : " + cronPattern);
        deferred.resolve("Tache crée : " + taskName);
    }
    else {
        var msg = "L'un des paramètres est incorrect : tâche=> " + taskName + " pattern Cron=> " + cronPattern + " méthode=> " + taskmethod;
        logger.error(msg);
        deferred.reject(msg);
    }

    return deferred.promise;
}

/**
 *
 * @param taskName
 * @param cronDate
 */
function updateTaskOnCronChange(taskName, cronDate) {
    var deferred = Q.defer();
    var currentCronDate = scheduler.jobs[taskName].cronTime.source;
    if (currentCronDate && cronDate) {
        if (cronDate !== currentCronDate) {
            if (checkCronPattern(cronDate)) {
                logger.info("Changement du rafraichissement pour la tache : " + taskName);
                scheduler.update(taskName, cronDate);
            }
        }

        deferred.resolve();
    }
    else {
        var msg = "L'un des pattern est incorrect : courant => " + currentCronDate + " nouveau : " + cronDate;
        logger.error(msg);
        deferred.reject(msg);
    }

    return deferred.promise;
}

/**
 * Méthode de démarrage d'un job.
 * @param taskName Le nom de la tache.
 */
function startTask(taskName) {
    scheduler.start(taskName);
}

/**
 * Méthode d'arrêt d'un job
 * @param taskName le nom de la tache.
 */
function stopTask(taskName) {
    scheduler.stop(taskName);
}

/**
 * vérification du pattern Cron
 * @param pattern : string - pattern à vérifier.
 */
function checkCronPattern(pattern) {
    var isValid = false;
    try {
        new CronJob(pattern, function () {
            return null;
        });
        isValid = true;
    } catch (ex) {
        errorHandle("Pattern d'ordonnanceur incorrect", ex);
        isValid = false;
    }

    return isValid;
}

/**
 * Error handle pour le logger
 * @param func Le nom de la fonction.
 * @param error L'erreur.
 */
function errorHandle(func, error) {
    logger.error("[" + func + "] Erreur rencontrée : " + error + " stacktrace : " + (error ? error.stack : "-"));
}

module.exports = {
    createJob: createJob,
    startTask: startTask,
    updateTaskOnCronChange: updateTaskOnCronChange,
    stopTask: stopTask
};
