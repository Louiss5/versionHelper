var app = angular.module("versionHelper", ["ui.bootstrap"]);
app.controller("versionController", versionController);

versionController.$inject = ["$scope", "$http", "$q"];

function versionController($scope, $http, $q) {
    $scope.isInit = true;
    $scope.dateOptions = {
        initDate: Date.now(),
        formatYear: 'yy',
        startingDay: 1
    };

    $scope.openDate = function (index) {
        index.opened = true;
    };

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
        $http.get('/data').then(
            UpdateData,
            errorCallback
        );
    };
    $scope.forceUpdate = function () {
        $http({
            method: "GET",
            url: '/forceUpdate'
        }).then(
            UpdateData,
            errorCallback
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
                function (result) {
                    $scope.alertMessage = result.data.message;
                    $(".alert-success").slideDown('slow').delay(1500).slideUp('slow');
                },
                errorCallback
            );
        }
        $scope.deployDateEdit = !$scope.deployDateEdit;
    };
    $scope.refreshData();
    $(".alert").hide();

    function UpdateData(result) {
        var data = result.data;
        $scope.dataTable = data.data;
        $scope.refreshDate = data.date;
        $scope.alertMessage = data.message;
        if (!$scope.isInit) {
            $scope.isInit = false;
            $(".alert-success").slideDown('slow').delay(1500).slideUp('slow');
        }
    }

    function errorCallback(error) {
        console.log("Error : " + JSON.stringify(error));
    }
}