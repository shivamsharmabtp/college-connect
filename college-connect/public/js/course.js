var fileUrl = undefined, fileSize = undefined;
var courseName = window.location.pathname.split('/')[2];
url = new URL(window.location.href);
var university = pageData.university;
var courseId = url.searchParams.get('v');

function fileTypeIconPos(type){
  if(type == 'file')
    return -23*32 + 'px';
  else if(type == 'video')
    return -24*32 + 'px';
  else
    return -22*32 + 'px';
}

function fileTypeIconTitle(type){
  if(type == 'file')
    return 'PDF'
  else if(type == 'video')
    return 'VIDEO'
  else
    return 'LINK'
}

function populate(data){
  if($(".general").children().length>1)
    $('.general').html('')
  if($(".qp").children().length>1)
    $('.qp').html('')
  if($(".ass").children().length>1)
    $('.ass').html('')
  if($(".books").children().length>1)
    $('.books').html('')  

  for(i=0; i<data.length; i++){
    a0 = '<span class="fileType" style="background-position-y : ' + fileTypeIconPos(data[i].fileType) + '" title=" ' + fileTypeIconTitle(data[i].fileType) + ' "></span>'
    a = '<a href="/read?doc='+ data[i].name.split(' ').join('-').toLowerCase() +'&v=' + data[i].id + '" >'
    b = '<div class="file"><div class="top">' + data[i].name + '</div><div class="bottom"><span class="viewcount">';
    c = data[i].views + '</span><span class="views"> Views. Uploaded </span><span class="uploaded">'
    d = moment(data[i].uploadTime).fromNow() + '</span><span class="by"> .</span> <a href="/user/'
    e = data[i].author + '" > <span class="uploader"> ' + data[i].authorName
    f = '</span></a></div></div></a>'
    a = a0+a;
    if(data[i].category < 2){
      $('.general > .nothingyet').hide()
      $('.general').append(a+b+c+d+e)
    }
    if(data[i].category == 2){
      $('.qp > .nothingyet').hide()
      $('.qp').append(a+b+c+d+e)
    }
    if(data[i].category == 3){
      $('.ass > .nothingyet').hide()
      $('.ass').append(a+b+c+d+e)
    }
    if(data[i].category == 4){
      $('.books > .nothingyet').hide()
      $('.books').append(a+b+c+d+e)
    }
      
  }
}

function populateDocList(){
  courseData = {
    courseId : courseId
  }

  cdata = {
    data: JSON.stringify(courseData)
  }

  $.ajax({
    url: "/file/filelist",
    method: "POST",
    data: cdata,
  }).done(function( msg ) {
    populate(msg);
  }).fail(function( jqXHR, status, error ) {
    console.log(error);
  });
}

function viewCount(){
  $.ajax({
      method : 'POST',
      url : '/view',
      contentType : 'application/json',
      data : JSON.stringify(pageData)
  })
}

$('document').ready(() => {
    $('.adddocbtn').click(() => {
      if($.cookie('li') != 1){
        window.location = '/user/signin?continue=' + window.location.href;
      }
      else{
        $('.add-doc-wrapper').slideToggle('fast', function() {});
      }
    });

    $('.addfilebtn').click(() => {
        $('.addurl-wrapper').hide();
        $('.addfile-wrapper').slideToggle('fast', function() {})
    });

    $('.addurlbtn').click(() => {
        $('.addfile-wrapper').hide();
        $('.addurl-wrapper').slideToggle('fast', function() {})
    });

    populateDocList();

    $('.addpdf').on('change', function(){
        fileUrl = undefined;
        toast('black','Uploading...')
        var files = $(this).get(0).files;
        
        if (files.length > 0){
          var formData = new FormData();
          // for (var i = 0; i < files.length; i++) {
          //   var file = files[i];
          //   formData.append('uploads[]', file, file.name);
          // }
          var file = files[0];
          formData.append('uploads[]', file, file.name);
          $('.f.name').val(file.name.split('.')[0]);    
      
          if(file.size > 100000000){
            toast('red', 'File size exceeded 100 MB limit!');
            return;
          }
          $.ajax({
            url: '/upload',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            beforeSend: function(request) {
              request.setRequestHeader("filetype", 'pdf');
            },
            success: function(data){
              if(String(data).includes('wrongFileType') ){
                $('.status').text('Some error occured while uploading please try again.')
                fileUrl = undefined;
                toast('red','Error occured while uploading.');
                return;
              }
                $('.status').text('Done!')
                fileUrl = data.url;
                fileSize = file.size;
                toast('green','Upload Complete');
            },
            xhr: function() {
              var xhr = new XMLHttpRequest();
              xhr.upload.addEventListener('progress', function(evt) {
  
                if (evt.lengthComputable) {
                  var percentComplete = evt.loaded / evt.total;
                  percentComplete = parseInt(percentComplete * 100);
      
                  $('.status').text('Uploading ' + percentComplete + '%');
                  //$('.progress-bar').width(percentComplete + '%');
      
                  if (percentComplete === 100) {
                    $('.status').html('Processing ...');
                  }
      
                }
      
              }, false);      
              return xhr;
            }
          });
        }
      });

      $('.addmanypdf').on('change', function(){
        fileUrl = undefined;
        var files = $(this).get(0).files;
        
        if (files.length > 0){
          uploadFiles(files);
        }
      });

      $('.f.save').click(function() {
        if(window.location.hostname == 'localhost' && !fileUrl){
          fileUrl = 'https://storage.googleapis.com/mlbu/qulusayu-cv-v1.0.1.pdf';
        }
        if(!fileUrl){
          toast('red', 'File not uploaded yet!')
          return;
        }
        toast('black','Saving...')
        //$('.spinner').show();
        formData = {
            name: $('.f.name').val(),
            url: fileUrl,
            description: $('.f.description').val(),
            category: $('.f.filetype').val(),
            university : pageData.university,
            courseName : courseName,
            courseId : courseId,
            type : 'file',
            fileSize : fileSize ? fileSize : null
        }
    
        fdata = {
          data: JSON.stringify(formData)
        }
    
        $.ajax({
          url: "/file/addfile",
          method: "POST",
          data: fdata,
        }).done(function( msg ) {
          toast('green','Saved!');
          $('.f.name').val('');
          $('.f.description').val('');
          $('.f.filetype').val(0);
          $('.adddocbtn').click();
          populateDocList();
        }).fail(function( jqXHR, status, error ) {
          console.log( "AddUniversity request failed: " + jqXHR.status );
          if(jqXHR.status == 401)
              toast('red','Sign In to complete task');
          if(jqXHR.status == 400)
              toast('red','File with this name already exist!');
          if(jqXHR.status == 500)
              toast('red','An Internal error occured. Please try again!');
        });
      });

      $('.u.save').click(function() {
        toast('black','Saving...')
        //$('.spinner').show();
        try {
          oUrl = new URL($('.u.url').val());
          if(oUrl.hostname.includes('magguland') || oUrl.hostname.includes('localhost') || oUrl.hostname.includes('universityeks') ){
            toast('red', 'Invalid URL!');
            return;
          }
        } catch (error) {
          toast('red', 'Invalid URL!');
          return;
        }

        let url = $('.u.url').val();
        if(url.includes('youtube.com/watch?') || url.includes('youtu.be'))
          docType = 'video';
        else
          docType = 'link';

        formData = {
            name: $('.u.name').val(),
            url: $('.u.url').val(),
            description: $('.u.description').val(),
            category: $('.u.filetype').val(),
            university : pageData.university,
            courseName : courseName,
            courseId : courseId,
            type : docType
        }
    
        fdata = {
          data: JSON.stringify(formData)
        }
    
        $.ajax({
          url: "/file/addfile",
          method: "POST",
          data: fdata,
        }).done(function( msg ) {
          toast('green','Saved!');
          $('.u.name').val('');
          $('.u.url').val('');
          $('.u.description').val('');
          $('.u.filetype').val(0);
          $('.adddocbtn').click();
          populateDocList();
        }).fail(function( jqXHR, status, error ) {
          console.log( "AddUniversity request failed: " + jqXHR.status );
          if(jqXHR.status == 401)
              toast('red','Sign In to complete task');
          if(jqXHR.status == 400)
              toast('red','File with this name already exist!');
          if(jqXHR.status == 500)
              toast('red','An Internal error occured. Please try again!');
        });
      });
      viewCount();

});

function setName(){
  let url = $('.u.url').val();
  if($('.u.name').val() == '' && url.includes('.pdf') ){
    $('.u.name').val(decodeURI(url.split('/')[url.split('/').length - 1]).split('.')[0]);
  }
}

async function uploadFiles(files){
  for(let i=0; i<files.length; i++){
    await uploadFile(files[i])
  }
}

async function uploadFile(file){
  if(file.size > 100000000){
    toast('red', 'File ' + file.name + ' size exceeded 100 MB limit!');
    return;
  }
  toast('black', 'Uploading ' + file.name);
  let formData = new FormData();
  formData.append('uploads[]', file, file.name);
  $.ajax({
    url: '/upload',
    type: 'POST',
    data: formData,
    processData: false,
    contentType: false,
    beforeSend: function(request) {
      request.setRequestHeader("filetype", 'pdf');
    },
    success: function(data){
      if(String(data).includes('wrongFileType') ){
        $('.status').text('Some error occured while uploading please try again.')
        fileUrl = undefined;
        toast('red','Error occured while uploading.');
        return;
      }
        $('.status').text('Done!')
        docFileUrl = data.url;
        docFileSize = file.size;
        docName = file.name.split('.pdf')[0];
        saveUpload(docFileSize, docFileUrl, docName);
        toast('green', file.name + ' Uploaded');
    },
  });
}

function saveUpload(size, url, name){
  formData = {
    name: name,
    url: url,
    category: $('.f.filetypeMultiple').val(),
    university : pageData.university,
    courseName : courseName,
    courseId : courseId,
    type : 'file',
    fileSize : size ? size : null
  }

  fdata = {
    data: JSON.stringify(formData)
  }

  $.ajax({
    url: "/file/addfile",
    method: "POST",
    data: fdata,
  }).done(function( msg ) {
    toast('green','Saved!');
    populateDocList();
  }).fail(function( jqXHR, status, error ) {
    console.log( "AddUniversity request failed: " + jqXHR.status );
    if(jqXHR.status == 401)
        toast('red','Sign In to complete task');
    if(jqXHR.status == 400)
        toast('red','File with this name already exist!');
    if(jqXHR.status == 500)
        toast('red','An Internal error occured. Please try again!');
  });
}