function populateUniversity(data) {
  for (i = 0; i < data.length; i++) {
    if(data[i].status == 'trial')
      a1 = '<a href="/university/' + data[i].shortName + '" class="pending-univ">';
    else
      a1 = '<a href="/university/' + data[i].shortName + '">';
    a = '<div class="unv-item"><div class="unv-item-title">';
    if (data[i].status == "trial")
      b = data[i].name + '<span class="pending-status"> ( Pending )</span>';
    else b = data[i].name;
    c = '</div><div class="unv-item-detail">';
    d = data[i].address;
    e = '</div><div class="unv-item-count">';
    f =
      nFormatter(data[i].docCount, 1) +
      " Documents " +
      nFormatter(data[i].courseCount, 1) +
      " Courses";
    g = "</div></div></a>";
    $(".unv-body").append(a1 + a + b + c + d + e + f + g);
  }
}

function nFormatter(num, digits) {
  var si = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" },
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

$("document").ready(() => {
  $.ajax({
    url: "/university/universitylist",
    method: "POST",
  })
    .done(function (msg) {
      populateUniversity(msg);
    })
    .fail(function (jqXHR, status, error) {
      console.log("Error loading universities");
    });
});
