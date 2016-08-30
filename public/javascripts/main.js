$( document ).ready(function() {
    // Click Modifier
    $('.modifyBtn').click(function(){
        if ($(this).parent()[0] == $($('.table tbody tr')[7]).children()[7]){
            alert('Modification 1 !');
        }
        else {
            alert('Modification 2 !');
        }
    });

    // Click Enregistrer
    $('.saveBtn').click(function(){
        if ($(this).parent()[0] == $($('.table tbody tr')[7]).children()[7]){
            alert('Enregistrement 1 !');
        }
        else {
            alert('Enregistrement 2 !');
        }
    });

    // Click Refresh
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