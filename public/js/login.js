$("#loginButton").click(function() {loginRequest()});

$("#username").keyup(function(event) {
    if (event.keyCode == 13) {
        loginRequest();
    }
})

$("#password").keyup(function(event) {
    if (event.keyCode == 13) {
        loginRequest();
    }
})

function loginRequest() {
    let username = $("#username").val();
    let password = $("#password").val();
    if (username == "" || password == "") {
        alert("You must fill in a username and password");
    } else {
        //all is in order
        $.ajax({
          type: "POST",
          url: "/login",
          data: {username: username, password: password},
          success: function(data, status, res){
              if (res.status == 200) {
                  //succesful login
                  window.location.href = "/admin";
              }
          },
          error: function(res) {
              if (res.status == 401) {
                  //not entry in the db
                  alert("Wrong combination");
              } else if (res.status == 400) {
                  //empty field
                  alert("Fill in all fields")
              } else {
                  alert("Something went wrong")
              }
          }
    });
    }
}
