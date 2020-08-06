//get the data of the user currently logged in
async function getUserData() {
    const response = await fetch("/user", {
        headers: {
            'Content-type': 'application/json'
        }
    })
    const jsonRes = await response.json();

    return jsonRes.username;
}

function togglePwDiv() {
    let passwordDiv = document.getElementById("passwordDiv")
    if (passwordDiv.style.display == "block") {
        passwordDiv.style.display = 'none';
    } else {
        passwordDiv.style.display = 'block'
    }
}

//setup page properly
async function setUp() {
    let username = await getUserData();
    document.getElementById("usernameText").innerHTML = username;

}

function changePw() {
    let oldPw = $("#oldPw").val();
    let newPw = $("#newPw").val();
    let newPw2 = $("#newPw2").val();

    //check if all fiels are filled in
    if (oldPw == "" || newPw == "" || newPw2 == "") {
        alert("Fill in all fields");
        return;
    }

    //check if new password fields match
    if (newPw != newPw2) {
        alert("Passwords are not the same");
        return;
    }

    updatePw(oldPw, newPw);
}

//checks if the password is correct for current user (returns bool)
async function updatePw(oldPw, newPw) {
    $.ajax({
      type: "POST",
      url: "/changepw",
      data: {oldPw: oldPw, newPw: newPw},
      statusCode:{
          200: function() {
              alert("password succesfully changed")
              location.reload();
          },
          401: function() {
              alert("old password incorrect")
          }
      }
    })
}
