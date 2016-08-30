$( document ).ready(function() {
    // Click Modifier
    $('.modifyBtn').click(function(){
        if ($(this).parent()[0] == $($('.table tbody tr')[7]).children()[7]){
            for (i=1; i<=6; i++) {
                var html = $($($('.table tbody tr')[7]).children()[i]).html();
                var input = $('<td><input type="text" size="15"/></td>');
                input.val(html);
                $($($('.table tbody tr')[7]).children()[i]).replaceWith(input);
            }
        }
        else {
            for (i=1; i<=6; i++) {
                var html = $($($('.table tbody tr')[8]).children()[i]).html();
                var input = $('<td><input type="text" size="15"/></td>');
                input.val(html);
                $($($('.table tbody tr')[8]).children()[i]).replaceWith(input);
            }
        }
    });

    // Click Enregistrer
    $('.saveBtn').click(function(){
        if ($(this).parent()[0] == $($('.table tbody tr')[7]).children()[7]){
            for (i=1; i<=6; i++) {
                var valueText = $('<td>' + $($('.table tbody tr')[7]).find("input")[i-1].value + '</td>');
                $($($('.table tbody tr')[7]).children()[i]).replaceWith(valueText);
            }
        }
        else {
            for (i=1; i<=6; i++) {
                var valueText = $('<td></td>');
                $($($('.table tbody tr')[7]).children()[i]).replaceWith(valueText);
            }
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