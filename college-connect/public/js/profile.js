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

function depPos(dName) {
  if (dName) {
    dName = dName.department;
    for (j = 0; j < deps.length; j++)
      if (deps[j].shortName == dName) return deps[j].pos * -64;
  } else return 0;
  return 0;
}

function depName(dName) {
  for (j = 0; j < deps.length; j++)
    if (deps[j].shortName == dName) return deps[j].name;
}

function loadBasic() {
  $.ajax({
    url: "/user/getBasic",
    method: "POST",
    headers: { "x-auth": localStorage.getItem("x-auth") },
    data: {
      data: JSON.stringify({
        id: window.location.href.split("/")[4].replace("#", ""),
      }),
    },
  })
    .done((msg) => {
      setupBasicInfo(msg);
    })
    .fail((jqXHR, status, error) => {
      console.log(error);
    });
}

function loadDocs() {
  $.ajax({
    url: "/user/getDocs",
    method: "POST",
    headers: { "x-auth": localStorage.getItem("x-auth") },
    data: {
      data: JSON.stringify({
        id: window.location.href.split("/")[4].replace("#", ""),
        skip: 0,
        limit: 10,
      }),
    },
  })
    .done((msg) => {
      $(".spinner").hide();
      setupDocsInfo(msg);
    })
    .fail((jqXHR, status, error) => {
      console.log(error);
    });
}

function setupBasicInfo(data) {
  if (data.userId) {
    if (data.userId == window.location.href.split("/")[4].replace("#", "")) {
      $(".edit").show();
      $("[for=tab2]").show();
      $(".google").children()[0].style.backgroundImage =
        "url(" + data.googlePhoto + ")";
      eHash = md5(data.email);
      $(".identicon").children()[0].style.backgroundImage =
        'url("https://gravatar.com/avatar/' +
        eHash +
        '?s=100&d=identicon&f=y")';
      $(".gravatar").children()[0].style.backgroundImage =
        'url("https://www.gravatar.com/avatar/' + eHash + '?s=100&d=robohash")';
      $(".gravatar-link").attr("href", "http://gravatar.com/" + eHash);
    }
  }
  data.userId
    ? data.userId == window.location.href.split("/")[4].replace("#", "")
      ? $(".edit").show()
      : $(".edit").hide()
    : $(".edit").hide();
  let aboutMe = $(".detail-value-text");
  if (data.description && data.description != "Not Available") {
    aboutMe[0].textContent = data.description;
  } else {
    aboutMe[0].textContent = "Not Available";
    aboutMe[0].style.color = "#aaa";
  }
  if (data.university && data.university != "Not Available") {
    aboutMe[1].textContent = data.university;
  } else {
    aboutMe[1].textContent = "Not Available";
    aboutMe[1].style.color = "#aaa";
  }
  if (data.department && data.department != "Not Available") {
    aboutMe[2].textContent = data.department;
  } else {
    aboutMe[2].textContent = "Not Available";
    aboutMe[2].style.color = "#aaa";
  }
}

function setupDocsInfo(data) {
  if (data.length == 0) $(".notfound").show();
  for (i = 0; i < data.length; i++) {
    if (data[i].pathData) {
      a =
        '<div class="file"><div class="thumbnail" style="background-position-y: ' +
        depPos(data[i].pathData) +
        'px;" title="' +
        depName(data[i].pathData.department) +
        ' - Department"></div><div class="file-details">';
      b =
        '<div class="top"><a href="/read?v=' +
        data[i].fileId +
        '" class="fileLink">' +
        data[i].name +
        "</a></div>";
      c =
        '<div class="bottom"><a href="/user/' +
        data[i].author +
        '">' +
        data[i].authorName +
        "</a> &#8226 " +
        nFormatter(data[i].views, 1) +
        " Views &#8226 Uploaded " +
        moment(data[i].time).fromNow() +
        "</div>";
      d = '<div class="bottom">' + data[i].description + "</div>";
      e =
        '<div class="bottom">Path : <a href="/university/' +
        data[i].university +
        '">' +
        data[i].university +
        "</a>/" +
        data[i].pathData.department +
        "/" +
        data[i].pathData.paths[0].semester +
        '/<a href="/course/' +
        data[i].pathData.shortName +
        "?university=" +
        data[i].university +
        "&v=" +
        data[i].pathData._id +
        '">' +
        data[i].pathData.shortName +
        "</div></div></div>";

      $(".search-result").append(a + b + c + d + e);
    }
  }
}

function updateBasic() {
  userData = {
    description: $(".detail-value-text")[0].textContent,
    university: $(".detail-value-text")[1].textContent,
    department: $(".detail-value-text")[2].textContent,
  };
  $.ajax({
    url: "/user/updateBasic",
    method: "POST",
    data: { data: JSON.stringify(userData) },
  })
    .done((msg) => {
      toast("green", "Updated Succesfully!");
    })
    .fail((jqXHR, status, error) => {
      console.log(error);
      toast("red", "Error proccessing request!");
    });
}

function updateProfilePic(pic) {
  picData = { profilePicture: pic };
  $.ajax({
    url: "/user/updateProfilePicture",
    method: "POST",
    data: { data: JSON.stringify(picData) },
  })
    .done((msg) => {
      toast("green", "Profile picture updated!");
      $(".profile-pic").css("background-image", 'url("' + pic + '")');
      $(".picture").css("background-image", 'url("' + pic + '")');
    })
    .fail((jqXHR, status, error) => {
      console.log(error);
      toast("red", "Error updating profile picture.");
    });
}

function setProfilePic(pic) {
  imgUrl = $(".sample-pic")
    [pic].style.backgroundImage.replace("url(", "")
    .replace(")", "")
    .replace(/\"/gi, "");
  updateProfilePic(imgUrl);
}

$(document).ready(() => {
  loadBasic();
  loadDocs();

  $(".edit").click(function (e) {
    e.preventDefault();
    let aboutMe = $(".detail-value-text");
    for (let i = 0; i < aboutMe.length; i++) {
      if (aboutMe[i].textContent == "Not Available")
        aboutMe[i].textContent = "";
    }
    $(".detail-value-text").attr("contenteditable", "true");
    $(".detail-value-text").addClass("editing");
    $(this).hide();
    $(".save, .cancel").show();
  });
  $(".cancel").click(() => {
    $(".detail-value-text").removeClass("editing");
    $(".save, .cancel").hide();
    $(".edit").show();
    loadBasic();
  });
  $(".save").click(() => {
    updateBasic();
    $(".detail-value-text").removeClass("editing");
    $(".save, .cancel").hide();
    $(".edit").show();
    loadBasic();
  });
});
