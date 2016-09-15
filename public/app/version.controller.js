var app = angular.module("versionHelper", []);
app.controller("versionController", versionController);

versionController.$inject = ["$scope"];

function versionController($scope) {
    $scope.mpdEdit = false;
    $scope.deployDateEdit = false;
    $scope.lotEdit = false;
    $scope.deployments = {
        "DevLot1": {
            date: "",
            lot: ""
        },
        "DevLot2": {
            date: "",
            lot: ""
        },
        "DR1": {
            date: "",
            lot: ""
        },
        "DR2": {
            date: "",
            lot: ""
        },
        "DR3": {
            date: "",
            lot: ""
        },
        "DR4": {
            date: "",
            lot: ""
        },
        "DR5": {
            date: "",
            lot: ""
        },
        "DR6": {
            date: "",
            lot: ""
        }
    };
    $scope.mpdPlateforms = [
        "integration1",
        "integration2",
        "integration3",
        "recette1",
        "recette2",
        "recette3"
    ];
    $scope.dataTable = {};
    $scope.refreshData = function () {
        $.ajax(
            {
                method: "GET",
                url: "/data",
                success: function (result) {
                    $scope.dataTable = result;
                    $scope.$apply();
                },
                error: function (error) {
                    console.log("Error : " + error);
                }
            }
        );
    };
    $scope.changeBoolean = function (isbool) {
        isbool = !isbool;
    };
    $scope.refreshData();
}