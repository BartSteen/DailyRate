let nameText;
let rating;
let showingScale = false;

//get the data of the user currently logged in
async function getUserData() {
    let response = await fetch("/user", {
        headers: {
            'Content-type': 'application/json'
        }
    })
    let jsonRes = await response.json();
    return jsonRes;
}

//get the rating data of today
async function getRateData(date) {
    if (!date) {
        date = new Date();
    }
    let res = await $.ajax({
        type: "GET",
        url: "/rate",
        data: {dateString: date.toDateString()},
    })

    return res.rating;
}

//sets the page according to if today has been rated yet or not
function showRatingText(score) {
    showingScale = true;
    if (score) {
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
async function setTexts() {
    let dateText = document.getElementById("dateText");
    nameText = document.getElementById("nameText");

    //show current date
    let date = new Date();
    dateText.innerHTML = date.toDateString()

    //show username
    let userData = await getUserData();
    nameText.innerHTML = userData.username;

    //get rating data and display it if necessary
    let rating = await getRateData(date);
    showRatingText(rating);
}

//scale rating buttons actions
$(".scaleButtons").click(function() {
    rating = parseInt(this.textContent);
})

//rate button action
$("#rateButton").click(function() {
    let date = new Date();
    if (!rating) {
        alert("Select a rating first")
    } else {
        //post it to the server
        $.ajax({
          type: "POST",
          url: "/rate",
          data: {dateString: date.toDateString(), rating: rating},
          success: async function(data, status, res){
              let rating = await getRateData();
              showRatingText(rating);
          },
          error: function(res) {
              alert("Something went wrong")
              console.log(res);
          }
    });
    }
})

//action when specific date rating is clicked
$("#getRateButton").click(async function() {
    let dateElem = document.getElementById("dateGiver");
    let textElem = document.getElementById("dateRateText");
    let selectedDate = new Date(dateElem.value)

    textElem.innerHTML = await getRateData(selectedDate);

})

//action to logout from current account and auto redirect
function logout() {
    fetch("/logout").then(window.location.href="/login")
}
