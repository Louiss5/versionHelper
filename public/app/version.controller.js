var app = angular.module("versionHelper", []);
app.controller("versionController", versionController);

versionController.$inject = ["$scope", "$http"];

function versionController($scope, $http) {
    $scope.mpdEdit = false;
    $scope.deployDateEdit = false;
    $scope.lotEdit = false;
    $scope.mpdPlateforms = [
        "integration1",
        "integration2",
        "integration3",
        "recette1",
        "recette2",
        "recette3"
    ];
    $scope.dataTable = {};
    $scope.refreshDate = "";
    $scope.refreshData = function () {
        $.ajax(
            {
                method: "GET",
                url: "/data",
                success: function (result) {
                    $scope.dataTable = result.data;
                    $scope.refreshDate = result.date;
                    $scope.$apply();
                },
                error: function (error) {
                    console.log("Error : " + JSON.stringify(error));
                }
            }
        );
    };
    $scope.forceUpdate = function () {
        $.ajax(
            {
                method: "GET",
                url: "/forceUpdate",
                success: function (result) {
                    $scope.dataTable = result.data;
                    $scope.refreshDate = result.date;
                    $scope.$apply();
                },
                error: function (error) {
                    console.log("Error : " + JSON.stringify(error));
                }
            }
        );
    };
    $scope.deployDateChange = function () {
        if ($scope.deployDateEdit) {
            $scope.dataTable.Deploy.forEach(function (deploy) {
                delete deploy["$$hashKey"];
            });
            $http({
                method: "POST",
                data: $scope.dataTable.Deploy,
                url: '/deployDate'
            }).then(
                function () {
                    $(".alert-success").slideDown('slow').delay(1500).slideUp('slow');
                },
                function (error) {
                    console.log("Error : " + JSON.stringify(error));
                });
        }
        $scope.deployDateEdit = !$scope.deployDateEdit;
    };
    $scope.refreshData();
    $(".alert").hide();
}