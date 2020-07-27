$("#loginButton").click(function() {
    let username = $("#username").val();
    let password = $("#password").val();
    if (username == "" || password == "") {
        alert("You must fill in a username and password");
    } else {
        $.post("/login", {username:username, password:password}, function(data, status) {
            console.log("Data: " + data + "\nStatus: " + status)
            if (data.toLowerCase().includes("failed")) {
                alert("Wrong combination");
            } else {
            window.location.href = "/admin";
            }
        })
    }
})

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
