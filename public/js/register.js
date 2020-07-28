
$("#username").keyup(function(event) {
    if (event.keyCode == 13) {
        registerRequest();
    }
})

$("#password").keyup(function(event) {
    if (event.keyCode == 13) {
        registerRequest();
    }
})

$("#password2").keyup(function(event) {
    if (event.keyCode == 13) {
        registerRequest();
    }
})


$("#registerButton").click(function() {
    registerRequest();
})

function registerRequest() {
    let username = $("#username").val();
    let password = $("#password").val();
    let password2 = $("#password2").val()
    if (username == "" || password == "" || password2 == "") {
        //all is in order
        alert("You must fill in all fields");
    } else if (password != password2) {
        alert("Passwords do not match");
    } else {
        //all is in order
        $.ajax({
          type: "POST",
          url: "/register",
          data: {username: username, password: password},
          success: function(data, status, res){
              if (res.status == 201) {
                  //succesfully created account
                  alert("Success");
                  window.location.href = "/login"
              }
          },
          error: function(res) {
              if (res.status == 400) {
                  //Empty fields
                  alert("Fill in all fields")
              } else if (res.status == 409) {
                  //username taken
                  alert("Username is already taken")
              } else {
                  //if this triggers idk
                  alert("Something went wrong")
              }
          }
    });
    }
}
