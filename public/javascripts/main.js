$( document ).ready(function() {
    $('#refreshBtn').click(function(){
        var that = this;
        that.disabled = true;
        $.ajax({url: "/data", success: function(result){
            for (i = 0; i < $('tbody tr').length - 2 ; i++){
                for (j = 0; j < $($($('tbody tr')[i]).children('td')).length - 1; j++) {
                    $($($($('tbody tr')[i]).children('td'))[j]).text(result.version[i][j]);
                    console.log(result);
                }
            }
            that.disabled = false;
        }});
    });
});