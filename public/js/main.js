let date;
let username;
let nameText;

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
    console.log(this.textContent);
})
