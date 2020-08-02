let date;
let username;
let nameText;
let rating;
let showingScale = false;

//get the data of the user currently logged in
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

//get the rating data of today
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

//sets the page according to if today has been rated yet or not
function showRatingText(score) {
    if (score) {
        showingScale = true;
        toggleScale();
        document.getElementById("scoreText").innerHTML = score;
        document.getElementById("toggleButton").style.display = 'initial'
    } else {
        toggleScale();
        document.getElementById("toggleButton").style.display = 'none'
    }
}

//toggles between showing the scale and the current rating
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

//sets the proper initial texts on the page
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

//scale rating buttons actions
$(".scaleButtons").click(function() {
    rating = parseInt(this.textContent);
})

//rate button action
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

//action when specific date rating is clicked
$("#getRateButton").click(function() {
    let dateElem = document.getElementById("dateGiver");
    let textElem = document.getElementById("dateRateText");
    let selectedDate = new Date(dateElem.value)

    $.ajax({
        type: "GET",
        url: "/rate",
        data: {dateString: selectedDate.toDateString()},
        success: function(data, status, res) {
            textElem.innerHTML = data.rating;
        },
        error: function(err) {
            alert("Something went wrong")
        }
    })
})

//action to logout from current account and auto redirect
function logout() {
    fetch("/logout").then(window.location.href="/login")
}
