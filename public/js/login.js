$("#loginButton").click(function() {loginRequest()});

$("#registerButton").click(function() {
    let username = $("#username").val();
    let password = $("#password").val();
    if (username == "" || password == "") {
        alert("You must fill in a username and password");
    } else {
        $.post("/register", {username:username, password:password}, function(data, status) {
            console.log("Data: " + data + "\nStatus: " + status)
        })
    }
})


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
        $.post("/login", {username:username, password:password}, function(data, status) {
            if (data.toLowerCase().includes("failed")) {
                alert("Wrong combination");
            } else {
            window.location.href = "/admin";
            }
        })
    }
}
