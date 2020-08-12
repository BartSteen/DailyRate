let username;

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

//get all ratings of current user
async function getAllRatingData() {
    let response = await fetch("/allratings", {
        headers: {
            'Content-type': 'application/json'
        }
    })
    let jsonRes = await response.json();
    console.log(jsonRes);
    return jsonRes;
}

function togglePwDiv() {
    toggleDiv(document.getElementById("passwordDiv"))
}

function toggleImportDiv() {
    document.getElementById("exportDiv").style.display = 'none'
    toggleDiv(document.getElementById("importDiv"))
}

function toggleExportDiv() {
    document.getElementById("importDiv").style.display = 'none'
    toggleDiv(document.getElementById("exportDiv"))
}

function toggleDiv(div) {
    if (div.style.display == "block") {
        div.style.display = 'none'
    } else {
        div.style.display = 'block'
    }
}

//setup page properly
async function setUp() {
    username = await getUserData();
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

async function downloadRatings() {
    let ratings = await getAllRatingData();

    //make it a csv
    let csvContent = "data:text/csv;charset=utf-8,";
    for (i = 0; i < ratings.length; i++) {
        csvContent += ratings[i].date + "," + ratings[i].rating;
        if (i < ratings.length-1) {
            csvContent += "\n"
        }
    }

    //downlaod the thing
    let encodedUri = encodeURI(csvContent);
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "ratings-" + username.toLowerCase() +".csv" )
    document.body.appendChild(link);

    link.click()
}
