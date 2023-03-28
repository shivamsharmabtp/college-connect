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
  $('.spinner').hide()
  if(data.length==0)
  $('.notfound').show();
  else{
    $('.searchResultList').html('');
    for(i=0; i<data.length; i++){
      if(data[i].pathData){
        docShortName = data[i].name.split(' ').join('-').toLowerCase()
        a = '<div class="file"><div class="thumbnail" style="background-position-y: ' + depPos(data[i].pathData) + 'px;" title="' + depName(data[i].pathData.department) + ' - Department"></div><div class="file-details">'
        b = '<div class="top"><a href="/read?doc=' + docShortName + '&v=' + data[i].fileId + '&source=search&query=' + document.getElementsByClassName('mainSearch')[0].value + '" class="fileLink">' + data[i].name + '</a></div>'
        c = '<div class="bottom"><a href="/user/' + data[i].author + '">' + data[i].authorName + '</a> &#8226 ' + nFormatter(data[i].views,1) + ' Views &#8226 Uploaded ' + moment(data[i].time).fromNow() + '</div>'
        d = '<div class="bottom">' + data[i].description + '</div>'
        e = '<div class="bottom">Path : <a href="/university/' + data[i].university + '">' + data[i].university + '</a>/' + data[i].pathData.department + '/' + data[i].pathData.paths[0].semester + '/<a href="/course/' + data[i].pathData.shortName + '?university=' + data[i].university + '&v=' + data[i].pathData._id + '">' + data[i].pathData.shortName + '</div></div></div>'
        
        $('.searchResultList').append(a+b+c+d+e);
      }
    }
  }
}

$('document').ready(function () {
  runSearch('pageLoad');
})


