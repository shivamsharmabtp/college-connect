$(document).ready(function () {
  $(".js-example-basic-multiple").select2({
    placeholder: "Choose Departments of Study",
    dropdownAutoWidth: true,
  });

  for (i = 0; i < deps.length; i++) {
    var option =
      '<option value="' + deps[i].shortName + '">' + deps[i].name + "</option>";
    $(".js-example-basic-multiple").append(option);
  }

  var picurl = undefined;

  $(".picture").on("change", function () {
    toast("black", "Uploading...");
    var files = $(this).get(0).files;

    if (files.length > 0) {
      var formData = new FormData();

      for (var i = 0; i < files.length; i++) {
        var file = files[i];

        formData.append("uploads[]", file, file.name);
      }

      $.ajax({
        url: "/upload",
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        beforeSend: function (request) {
          request.setRequestHeader("filetype", "image");
        },
        success: function (data) {
          picurl = data.url;
          toast("green", "Upload Complete");
        },
        xhr: function () {
          var xhr = new XMLHttpRequest();
          xhr.upload.addEventListener(
            "progress",
            function (evt) {
              if (evt.lengthComputable) {
                var percentComplete = evt.loaded / evt.total;
                percentComplete = parseInt(percentComplete * 100);
                $(".progress-bar").show();
                $(".progress-bar").text(percentComplete + "% Uploaded");
                //$('.progress-bar').width(percentComplete + '%');

                // if (percentComplete === 100) {
                //   $('.progress-bar').html('Done');
                // }
              }
            },
            false
          );

          return xhr;
        },
      });
    }
  });

  $(".done").click(function () {
    if (!picurl) {
      toast("red", "Image not uploaded yet!");
      return;
    }
    toast("black", "Saving...");
    //$('.spinner').show();
    formData = {
      name: $(".c.name")[0].value,
      address: $(".c.address")[0].value,
      description: $(".c.description")[0].value,
      picture: picurl,
      departments: $(".js-example-basic-multiple").val(),
      notInListDepartments: $(".depsNotInList").val(),
    };

    fdata = {
      data: JSON.stringify(formData),
    };

    $.ajax({
      url: "/university/adduniversity",
      method: "POST",
      data: fdata,
    })
      .done(function (msg) {
        toast("green", "Application Submitted!");
        //$('.spinner').hide();
        universityUrl = formData.name.toLowerCase().split(" ").join("-");
        window.location = "/universities";
      })
      .fail(function (jqXHR, status, error) {
        console.log("AddUniversity request failed: " + jqXHR.status);
        if (jqXHR.status == 400)
          toast("red", "University with this name already exist!");
        if (jqXHR.status == 500)
          toast("red", "An Internal error occured. Please try again!");
      });
  });
});
