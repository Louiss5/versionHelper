var app = angular.module("versionHelper", []);
app.controller("versionController", versionController);

versionController.$inject = [];

function versionController() {
    $.ajax(
        {
            method: "GET",
            url: "/data",
            success: function (result) {
                console.log("Retour data : " + result);
            },
            error: function (error) {
                console.log("Error : " + error);
            }
        }
    );
}