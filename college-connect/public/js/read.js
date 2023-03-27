
function fullscreen() {
    var isInFullScreen = (document.fullscreenElement && document.fullscreenElement !== null) ||
        (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
        (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
        (document.msFullscreenElement && document.msFullscreenElement !== null);

    var docElm = document.getElementsByClassName('reader')[0];
    if (!isInFullScreen) {
        if (docElm.requestFullscreen) {
            docElm.requestFullscreen();
        } else if (docElm.mozRequestFullScreen) {
            docElm.mozRequestFullScreen();
        } else if (docElm.webkitRequestFullScreen) {
            docElm.webkitRequestFullScreen();
        } else if (docElm.msRequestFullscreen) {
            docElm.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

function nFormatter(num, digits) {
    var si = [
      { value: 1, symbol: "" },
      { value: 1E3, symbol: "k" },
      { value: 1E6, symbol: "M" },
      { value: 1E9, symbol: "G" },
      { value: 1E12, symbol: "T" },
      { value: 1E15, symbol: "P" },
      { value: 1E18, symbol: "E" }
    ];
    var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var i;
    for (i = si.length - 1; i > 0; i--) {
      if (num >= si[i].value) {
        break;
      }
    }
    return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
}


function depPos(dName){
    if(dName){
        dName = dName.department;
        for(j=0;j<deps.length; j++)
        if(deps[j].shortName == dName)
            return deps[j].pos*(-64);
    }else
        return 0;
    return 0;
  }
  
  function depName(dName){
    for(j=0;j<deps.length; j++)
        if(deps[j].shortName == dName)
        return deps[j].name;
  }
  
  function setupDocsInfo(data){
    if(data.length==0)
    $('.notfound').show();
    for(i=0; i<data.length && i<15; i++){
        if(data[i].pathData){
            a = '<div class="file"><div class="thumbnail" style="background-position-y: ' + depPos(data[i].pathData) + 'px;" title="' + depName(data[i].pathData.department) + ' - Department"></div><div class="file-details">'
            b = '<div class="top"><a href="/read?doc=' + data[i].name.toLowerCase().trim().split(' ').join('-') + '&v=' + data[i].fileId + '&source=related" class="fileLink">' + data[i].name + '</a></div>'
            c = '<div class="bottom"><a href="/user/' + data[i].author + '">' + data[i].authorName + '</a> &#8226 ' + nFormatter(data[i].views,1) + ' Views &#8226 Uploaded ' + moment(data[i].time).fromNow() + '</div>'
            d = '<div class="bottom">' + data[i].description + '</div>'
            e = '<div class="bottom">Path : <a href="/university/' + data[i].university + '">' + data[i].university + '</a>/' + data[i].pathData.department + '/' + data[i].pathData.paths[0].semester + '/<a href="/course/' + data[i].pathData.shortName + '?university=' + data[i].university + '&v=' + data[i].pathData._id + '">' + data[i].pathData.shortName + '</div></div></div>'
    
            $('.secondary').append(a+b+c+d+e);
            $('.secondaryMobile').append(a+b+c+d+e);
        }
        
    }
  }


function createCookie(name,value,minutes) {
    if (minutes) {
        var date = new Date();
        date.setTime(date.getTime()+(minutes*60*1000));
        var expires = "; expires="+date.toGMTString();
    } else {
        var expires = "";
    }
    document.cookie = name+"="+value+expires+"; path=/";
}

function viewCount(){
    $.ajax({
        method : 'POST',
        url : '/view',
        contentType : 'application/json',
        data : JSON.stringify(pageData)
    })
}

function setupVotes(){
    voteCountData = {
        itemId : 'read-' + pageData.pageId
    }
    $.ajax({
        method : 'POST',
        url : '/vote/count',
        data : JSON.stringify(voteCountData),
        contentType : 'application/json'
    }).done(function(data){
        $('.like-count').text(nFormatter(data,1))
    })
}

$('document').ready(function () {
    createCookie("read", pageData.pageId, 5)

    if(localStorage.getItem('reads')){
        newRead = {
            v : pageData.pageId,
            name : $('.details > .title').text()
        }
        reads = JSON.parse(localStorage.getItem('reads'));
        var index = reads.findIndex(x => x.v == pageData.pageId);
        if (index > -1) {
        reads.splice(index, 1);
        }        
        if(reads.length<20)
            reads.push(newRead);
        localStorage.setItem('reads',JSON.stringify(reads));
    }else{
        reads = [];
        newRead = {
            v : pageData.pageId,
            name : $('.details > .title').text()
        }
        reads.push(newRead);
        localStorage.setItem('reads',JSON.stringify(reads));
    }

    searchData = {
        query : $('.details').children()[0].innerText,
        source : 'read-main'
    }

    sdata = {
      data: JSON.stringify(searchData)
    }

    $.ajax({
        url: "/file/search",
        method: "POST",
        data: sdata,
      }).done(function( msg ) {
        setupDocsInfo(msg)
      }).fail(function( jqXHR, status, error ) {
        console.log( "Search request failed: " + jqXHR.status );
      });

      $('.upvote').click(function(){
          voteData = {
              itemId : 'read-' + pageData.pageId,
              voteType : 'up'
          }
          $.ajax({
              method : 'POST',
              url : '/vote/cast',
              contentType : 'application/json',
              data : JSON.stringify(voteData)
          }).done(function(){
              setupVotes();
          }).fail((err)=>{
              toast('red', 'Please signin to post your opinion.')
          })
      })

      $('.downvote').click(function(){
        voteData = {
            itemId : 'read-' + pageData.pageId,
            voteType : 'down'
        }
        $.ajax({
            method : 'POST',
            url : '/vote/cast',
            contentType : 'application/json',
            data : JSON.stringify(voteData)
        }).done(function(){
            setupVotes();
        })
      })

      $('.shareDoc').click(function(){
        var text = window.location.href;
        navigator.clipboard.writeText(text).then(function() {
          toast('green', 'Sharable link copied !');
        }, function(err) {
          console.log(err);
        });
      })

      setupVotes();
      viewCount();
})
