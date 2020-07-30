let date;
let username;
let nameText;
let rating;


function getUserData() {
    fetch("/user", {
        headers: {
            'Content-type': 'application/json'
        }
    }).then(data => data.json())
    .then(result => {
        username = result.username;
        nameText.innerHTML = username;
    })
}

function setTexts() {
    let dateText = document.getElementById("dateText");
    nameText = document.getElementById("nameText");

    //show current date
    date = new Date();
    dateText.innerHTML = date.toDateString()//date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();

    //show username
    if (username) {
        nameText.innerHTML = username
    } else {
        getUserData();
    }
}

function logout() {
    fetch("/logout").then(window.location.href="/login")
}


//scale rating buttons actions
$(".scaleButtons").click(function() {
    rating = parseInt(this.textContent);
})

$("#rateButton").click(function() {
    if (!rating) {
        alert("Select a rating first")
    } else {
        //post it to the server
        $.ajax({
          type: "POST",
          url: "/rate",
          data: {dateString: date.toDateString(), rating: rating},
          success: function(data, status, res){
              alert("succes");
              console.log("data " + data + "\nStatus " + status + "\nres " + res);
          },
          error: function(res) {
              console.log(res);
          }
    });
    }
})
