function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }

function onSignIn(googleUser) {
    var date = new Date();
    $('.spinner').show();
    var profile = googleUser.getBasicProfile();
    var formData = {
        'password' : profile.getId(),
        'email' : profile.getEmail(),
        'name' : profile.getName(),
        'profilePicture' : profile.getImageUrl(),
        'idToken' : googleUser.getAuthResponse().id_token,
        'time' : date.getTime()
    }
    console.log(JSON.stringify(formData,undefined,2));
    $.ajax({
        url: "/user/google/signin",
        method: "POST",
        data: formData
      }).done(function( msg, status, req ) {
        $('.spinner').hide();
        setCookie('li','1',365)
        continueUrl = new URL(window.location.href);
        continueUrl =  continueUrl.href.split('continue=')[1]
        if(continueUrl)
            window.location = continueUrl;
        else
            window.location = '/';
      }).fail(function( jqXHR, status, error ) {
        console.log( "Login request failed: " + jqXHR.status );
        if(jqXHR.status == 400)
            $('.error').show();
      });
}