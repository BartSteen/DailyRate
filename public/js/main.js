let rating;
let date;

//sets up the entire page, only called at first page init
async function setUpPage() {
    //set the user name
    let nameText = document.getElementById("nameText");
    nameText.innerHTML = await getUserName();
    date = new Date()

    setUpRatingView();
}

//sets up the rating part of the page using the given date, called for every new date viewing
async function setUpRatingView() {
    //show the date in text
    let dateText = document.getElementById("dateText");
    dateText.innerHTML = date.toDateString()

    //get the rating of that date
    rating = await getRateData();
    //set it according to if that date is rated or not
    if (rating) {
        hideScale();
        document.getElementById("scoreText").innerHTML = rating;
        document.getElementById("toggleButton").style.display = 'initial'
    } else {
        showScale();
        document.getElementById("toggleButton").style.display = 'none'
    }

}

//get the data of the user currently logged in
async function getUserName() {
    let response = await fetch("/user", {
        headers: {
            'Content-type': 'application/json'
        }
    })
    let jsonRes = await response.json();
    return jsonRes.username;
}

//get the rating data of today
async function getRateData() {
    let res = await $.ajax({
        type: "GET",
        url: "/rate",
        data: {dateString: date.toDateString()},
    })

    return res.rating;
}

//shows the scale and hides the rating
function showScale() {
    document.getElementById("rateDiv").style.display = 'block'
    document.getElementById("isRatedDiv").style.display = 'none'
    document.getElementById("toggleButton").innerHTML = 'Show rating'
    indicateChoice()
}

//hides the scale and shows the rating
function hideScale() {
    document.getElementById("rateDiv").style.display = 'none'
    document.getElementById("isRatedDiv").style.display = 'block'
    document.getElementById("toggleButton").innerHTML = 'Change rating'
}

//toggles between scale modes (for the html button)
function toggleScale() {
    if (document.getElementById('rateDiv').style.display == 'none') {
        showScale();
    } else {
        hideScale();
    }
}


//colour the scale buttons
$(".scaleButtons").each(function(i) {
    let scalingFactor = 255/9;
    let redVal = Math.round(255 - scalingFactor * (this.textContent - 1));
    let greenVal = Math.round(scalingFactor * (this.textContent - 1));
    this.style.backgroundColor = `rgb(${redVal}, ${greenVal}, 70)`;
})

//scale rating buttons actions
$(".scaleButtons").click(function() {
    rating = parseInt(this.textContent);
    indicateChoice();
})

//hightlights the chosen score
function indicateChoice() {
    $(".scaleButtons").each(function(i) {
        if (this.textContent == rating) {
            this.style.fontSize = "36px";
        } else {
            this.style.fontSize = "24px";
        }
    })
}

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
          success: async function(data, status, res){
              setUpRatingView();
          },
          error: function(res) {
              alert("Something went wrong")
              console.log(res);
          }
    });
    }
})

//action when the remove rating button is selected
$("#removeButton").click(function() {
    //ask for confirmation
    let conf = confirm("Are you sure you want to remove this rating?")
    if (!conf) {
        return;
    }
    //post remove request
    $.ajax({
      type: "POST",
      url: "/removeRating",
      data: {dateString: date.toDateString()},
      success: async function(data, status, res){
          setUpRatingView();
      },
      error: function(res) {
          alert("Something went wrong")
          console.log(res);
      }
    });
})

//action when specific date rating is clicked
$("#getRateButton").click(async function() {
    let dateElem = document.getElementById("dateGiver");
    if (dateElem.value == "") {
        date = new Date();
    } else {
        date = new Date(dateElem.value)
    }
    setUpRatingView();
})

//action to logout from current account and auto redirect
function logout() {
    fetch("/logout").then(window.location.href="/login")
}
