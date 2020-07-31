let date;
let username;
let nameText;
let rating;
let showingScale = false;


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

function getRateData() {
    if (!date) {
        date = new Date();
    }
    $.ajax({
        type: "GET",
        url: "/rate",
        data: {dateString: date.toDateString()},
        success: function(data, status, res) {
            showRatingText(data.rating);
        },
        error: function(err) {
            alert("Something went wrong")
        }
    })
}

function showRatingText(score) {
    if (score) {
        showingScale = true;
        toggleScale();
        document.getElementById("scoreText").innerHTML = score;
    } else {
        toggleScale();
    }
}

function toggleScale() {
    let rateDiv = document.getElementById("rateDiv")
    let isRatedDiv = document.getElementById("isRatedDiv")
    let toggleButton = document.getElementById("toggleButton")
    if (showingScale) {
        rateDiv.style.display = 'none';
        isRatedDiv.style.display = 'block';
        toggleButton.innerHTML = "Change rating"
    } else {
        rateDiv.style.display = 'block';
        isRatedDiv.style.display = 'none';
        toggleButton.innerHTML = "Show rating"
    }
    showingScale = !showingScale
}

function setTexts() {
    let dateText = document.getElementById("dateText");
    nameText = document.getElementById("nameText");

    //show current date
    date = new Date();
    dateText.innerHTML = date.toDateString()

    //show username
    if (username) {
        nameText.innerHTML = username
    } else {
        getUserData();
    }
    getRateData();
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
              getRateData();
          },
          error: function(res) {
              alert("Something went wrong")
              console.log(res);
          }
    });
    }
})
