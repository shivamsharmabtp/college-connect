var dep, sem, university, editor;
var currentState = window.history.state;

$("document").ready(function () {
  setDeps()
    .then(() => {
      return sortDeps();
    })
    .then(() => {
      return setClicks();
    })
    .then(() => {
      return presetDeps();
    });

  $(".clg-cnt-btn").click(function () {
    $(".clg-cnt").hide();
    cnt = $(this).attr("data-btn");
    $(cnt).fadeIn(300);
    if (cnt == ".news-cnt-wrapper") {
      loadNews();
    }
  });

  $(".addcoursebtn").click(() => {
    $(".add-course-wrapper").slideToggle("fast", function () {});
  });

  $(".adddepbtn").click(() => {
    $(".add-dep-wrapper").slideToggle("fast", function () {});
  });

  $(".c-save").click(() => {
    saveCourse();
  });

  $(".d-save").click(() => {
    saveDepartment();
  });

  loadUniversityCourses();

  window.onpopstate = function (event) {
    setHistory(event);
  };
});

function setHistory(event) {
  var eventState = event.state;
  if (currentState == null) {
    currentState = {
      page: "depList",
      level: 0,
    };
  }
  if (eventState == null) {
    eventState = {
      page: "depList",
      level: 0,
    };
  }
  if (eventState.level < currentState.level) {
    currentState = eventState;
    backClick();
  } else {
    if (currentState.level == 1) {
      window.history.replaceState(
        { page: "depList", level: 0 },
        this.undefined,
        window.location.pathname
      );
      backClick();
    } else {
      backClick();
    }
  }
}

function saveDepartment() {
  formData = {
    name: $(".d-name").val(),
    university: university,
  };

  $.ajax({
    url: "/university/adddep",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(formData),
  })
    .done(function (msg) {
      $(".d-name").val("");
      $(".adddepbtn").click();
      window.location.reload();
    })
    .fail(function (jqXHR, status, error) {
      console.log("AddDep request failed: " + jqXHR.status);
      if (jqXHR.status == 401)
        toast("red", "Please sign-in to complete action");
      if (jqXHR.status == 500)
        toast("red", "An Internal error occured. Please try again!");
    });
}

function saveCourse() {
  formData = {
    name: $(".c-name").val(),
    university: university,
    department: dep,
    semester: sem,
  };

  fdata = {
    data: JSON.stringify(formData),
  };

  $.ajax({
    url: "/course/addcourse",
    method: "POST",
    data: fdata,
  })
    .done(function (msg) {
      toast("green", msg);
      $(".c-name").val("");
      $(".add-course-wrapper").slideToggle("fast", function () {});
      loadCourses();
    })
    .fail(function (jqXHR, status, error) {
      console.log("AddUniversity request failed: " + jqXHR.status);
      if (jqXHR.status == 401)
        toast("red", "Please sign-in to complete action");
      if (jqXHR.status == 400)
        toast("red", "University with this name already exist!");
      if (jqXHR.status == 500)
        toast("red", "An Internal error occured. Please try again!");
    });
}

function setDeps() {
  return new Promise((resolve, reject) => {
    university = window.location.href.split("?")[0].split("/")[4];
    $.ajax({
      url: "/university/universityDepList/" + university,
      method: "GET",
    })
      .then(function (data) {
        if (data.length == 0) toast("black", "No departments added");
        for (i = 0; i < deps.length; i++) {
          if (data.includes(deps[i].shortName)) {
            a =
              '<div class="dep item" dep="' +
              deps[i].shortName +
              '" style="background-position-y:';
            b = "-" + deps[i].pos * 32 + 'px">';
            c = deps[i].name;
            d = "</div>";
            $(".selectbox").append(a + b + c + d);
          }
        }
        resolve();
      })
      .fail(function (err) {
        console.log(err);
      });
  });
}

function setupCourse(msg) {
  return new Promise((resolve, reject) => {
    $(".spinner").hide();
    $(".notyet").hide();
    $(".c-list").html("");
    if (msg.length == 0) $(".notyet").show();
    for (i = 0; i < msg.length; i++) {
      a =
        '<a href="/course/' +
        msg[i].shortName +
        "?university=" +
        msg[i].university +
        "&v=" +
        msg[i]._id +
        '" > <div class="course item">';
      b = msg[i].name;
      c = "</div></a>";
      $(".c-list").append(a + b + c);
    }
  });
}

function loadCourses() {
  $(".spinner").show();
  $(".notyet").hide();
  return new Promise((resolve, reject) => {
    formData = {
      university: university,
      department: dep,
      semester: sem,
    };

    fdata = {
      data: JSON.stringify(formData),
    };

    $.ajax({
      url: "/course/list",
      method: "POST",
      data: fdata,
    })
      .done(function (data) {
        setupCourse(data);
      })
      .fail(function (jqXHR, status, error) {
        setupCourse([]);
        console.log("GET Course list request failed: " + jqXHR.status);
      });
  });
}

function sortDeps() {
  return new Promise((resolve, reject) => {
    $(".dep")
      .sort(function (a, b) {
        if (a.textContent < b.textContent) {
          return -1;
        } else {
          return 1;
        }
      })
      .appendTo(".selectbox");
    resolve();
  });
}

function presetDeps() {
  return new Promise((resolve, reject) => {
    var currentUrl = new URL(window.location.href);
    var dep = currentUrl.searchParams.get("department")
      ? currentUrl.searchParams.get("department")
      : $.cookie("dep");
    var depel = document.querySelector('[dep="' + dep + '"]');

    if (depel) depel.click();

    var sem = currentUrl.searchParams.get("sem")
      ? currentUrl.searchParams.get("sem")
      : $.cookie("sem");
    var semel = document.querySelector('[semId="' + sem + '"]');

    if (semel) semel.click();

    resolve();
  });
}

function setupSemesters(department) {
  document.getElementById("semList").innerHTML = "";
  deps.forEach(function (dep) {
    if (dep.shortName == department) {
      var semesters = dep.sems;
      semesters.forEach(function (sem) {
        semId = sem.toLowerCase().split(" ").join("-");
        a =
          '<div class="sem item" onclick="semClick(\'' +
          sem +
          "','" +
          semId +
          '\')" semId="' +
          semId +
          '" >';
        b = sem;
        c = "</div>";
        document.getElementById("semList").innerHTML += a + b + c;
      });
    }
  });
}

function semClick(semName, semId) {
  $(".c-list").html("");
  $(".seperator").removeClass("hidden");
  $(".current-sem").text(semName);
  sem = semId;
  $.cookie("sem", sem, { expires: 300 });
  $(".semesters").addClass("hidden");
  $(".courses").removeClass("hidden");
  loadCourses();
  if (location.search) var newParam = location.search + "&sem=" + sem;
  else var newParam = "?sem=" + sem;
  window.history.pushState(
    {
      page: "courseList",
      level: 2,
    },
    undefined,
    newParam
  );
  currentState = history.state;
}

function backClick() {
  if ($(".current-sem").text() != "") {
    $.removeCookie("sem");
    $(".seperator").addClass("hidden");
    $(".current-sem").text("");
    $(".semesters").removeClass("hidden");
    $(".courses").addClass("hidden");
  } else if ($(".current-dep").text() != "") {
    $.removeCookie("dep");
    $(".current-dep").text("");
    $(".departments").removeClass("hidden");
    $(".semesters").addClass("hidden");
  }
}

function setClicks() {
  return new Promise((resolve, reject) => {
    $(".dep").click(function () {
      $(".current-dep").text($(this).text());
      dep = $(this).attr("dep");
      $.cookie("dep", dep, { expires: 300 });
      $(".departments").addClass("hidden");
      setupSemesters(dep);
      $(".semesters").removeClass("hidden");
      window.history.pushState(
        {
          page: "semList",
          level: 1,
        },
        undefined,
        "?department=" + dep
      );
      currentState = history.state;
    });

    $(".sem").click();

    $(".back").click(function () {
      window.history.back();
    });

    resolve();
  });
}

function loadUniversityCourses() {
  $.ajax({
    url: "/university/courseList",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({ university }),
  })
    .then(function (data) {
      $("#courseName").autocomplete({
        source: data,
      });
    })
    .fail(function (err) {
      console.log(err);
    });
}
