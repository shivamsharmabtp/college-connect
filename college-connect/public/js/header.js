$("document").ready(function () {
  token = localStorage.getItem("x-auth");
  $.ajaxSetup({
    headers: { "x-auth": token },
  });

  $.ajax({
    url: "/user/userinfo",
    method: "POST",
  })
    .done(function (msg) {
      $(".n1").text(msg.name);
      $(".p1").css("background-image", "url(" + msg.profilePicture + ")");
      $(".profileLink").attr("href", "/user/" + msg._id);
    })
    .fail(function (jqXHR, status, error) {
      $(".p1").hide();
      $(".n1").text("Sign In");
      $(".n1").addClass("notLoggedIn");
      $(".profileLink").attr("href", "/user/signin");
      $(".option-item")[6].style.display = "none";
    });

  $(".searchBtn").click(() => {
    var tb = document.getElementsByClassName("mainSearch")[0];
    window.location = "/search?query=" + tb.value;
  });
});

function search(e) {
  //See notes about 'which' and 'key'
}

function runSearch(event) {
  if (event && event.keyCode == 13) {
    var tb = document.getElementsByClassName("mainSearch")[0];
    if (tb.value.length > 2) window.location = "/search?query=" + tb.value;
  }
  if (event != "pageLoad")
    query = document.getElementsByClassName("mainSearch")[0].value;
  else {
    query = new URL(window.location.href).searchParams.get("query");
    document.getElementsByClassName("mainSearch")[0].value = query;
  }

  searchData = {
    query: query,
  };

  sdata = {
    data: JSON.stringify(searchData),
  };

  if (query.length > 2 && window.location.href.includes("/search?query=")) {
    $(".spinner").show();
    $(".searchResultList").html("");
    $(".notfound").hide();
    $.ajax({
      url: "/file/search",
      method: "POST",
      data: sdata,
    })
      .done(function (msg) {
        setupDocsInfo(msg);
      })
      .fail(function (jqXHR, status, error) {
        console.log("Search request failed: " + jqXHR.status);
      });
  }
}
