var collection, keys, btnClicked, currentData, table = null;

$('document').ready(function(){

    $(document).on('click', '.editData', function(){
        $('.data-content').attr('contenteditable','true');
        var recordId = $(this).attr('elementId');
        var record = {};
        currentData.forEach(data => {if(data._id == recordId) record = data})
        $('.data-content').text(JSON.stringify(record, undefined, 2));
        $('.actionBtn').attr('action', 'update');
        $('.actionBtn').text('Save');
        $('.editorWrapper').show();
        $('.editorWrapper').css('display', 'flex');
    })

    $(document).on('click', '.deleteData', function(){
        $('.data-content').attr('contenteditable','false');
        var recordId = $(this).attr('elementId');
        var record = {};
        currentData.forEach(data => {if(data._id == recordId) record = data})
        $('.data-content').text(JSON.stringify(record, undefined, 2));
        $('.actionBtn').attr('action', 'delete');
        $('.actionBtn').text('Delete');
        $('.editorWrapper').show();
        $('.editorWrapper').css('display', 'flex');
    })

    $(document).on('click', '.actionBtn', function(){
        var data = $('.data-content').text();
        if( $(this).attr('action') == 'update' ){
            $.ajax({
                url:'/admin/edit/' + collection,
                method: 'POST',
                contentType : 'application/json',
                data : data
              }).done((msg)=>{
                  toast('green', 'Updated Succesfully!');
                  $('.editorWrapper').hide();
                  $('[collection=' + collection).click();
              }).fail((jqXHR, status, error)=>{
                  console.log(error);
                  $('.editorWrapper').hide();
                  toast('red','Error proccessing request!');
                  $('[collection=' + collection).click();
              })
        }else if( $(this).attr('action') == 'delete' ){
            $.ajax({
                url:'/admin/delete/' + collection,
                method: 'POST',
                contentType : 'application/json',
                data : data
              }).done((msg)=>{
                $('.editorWrapper').hide();
                toast('green', 'Deleted Succesfully!');
                $('[collection=' + collection).click();
              }).fail((jqXHR, status, error)=>{
                $('.editorWrapper').hide();
                  console.log(error);
                  toast('red','Error proccessing request!');
                  $('[collection=' + collection).click();
              })
        }
    })

    $(document).on('click', '.cancelBtn, .closeBtn', function(){
        $('.editorWrapper').hide();
    })

    $('.btnCol').click(function(){
        collection = $(this).attr('collection');
        var skip = document.getElementsByClassName('row').length;    
        $.ajax({
            url : 'admin/get/' + collection,
            method : 'POST',
            data : {skip}
        }).done(function(data){
            appendTableNew(data, collection);
        }).fail(function(xhr, status, err){
            console.log(err);
            toast('red','Error loading data');
        });
    });
    
    function appendTableNew(data, collection){
        if(table){
            $('#example').DataTable().destroy();
            $('#example').empty();
        }
        
        currentData = data;
        $('.total-records').text( 'Total ' + collection + ' : ' + data.length);
        if(data.length > 0){
            keys = Object.keys(data[0]);
            var ths = [];
            var columns = [];
            keys.forEach((key)=>{
                obj = { title : key }
                columns.push(obj)
                ths.push( '<th>' + key + '</th>' );
            })
            ths.push('<th>Edit</th><th>Delete</th>');
            
            var tr = '<tr>' + ths + '</tr>'
            var thead = '<thead>' + tr + '</thead>'
            //var tfoot = '<tfoot>' + tr + '</tfoot>'
            
            $('#example').html(thead);

            data.forEach(record => {
                tableRowData = '';
                keys.forEach(key => {
                    if(Array.isArray(record[key]))
                        tableRowData += '<td><pre style="text-align:left;">' + JSON.stringify(record[key], undefined, 2) + '</pre></td>'
                    else
                        tableRowData += '<td>' + record[key] + '</td>'
                })
                tableRowData += '<td><button class="rowBtn editData" elementId="' + record['_id'] + '">Edit</button></td>';
                tableRowData += '<td><button class="rowBtn deleteData" elementId="' + record['_id'] + '">Delete</button></td>';
                tableRow = '<tr>' + tableRowData + '</tr>'
                $('#example').append(tableRow);
            });
            
            table = $('#example').DataTable({
                "stateSave": true
            })
        } else{
            $('#example').html('');
        }
    }
});