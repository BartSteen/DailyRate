function getUserData() {
    let nameText = document.getElementById("nameText")
    fetch("/user", {
        headers: {
            'Content-type': 'application/json'
        }
    }).then(data => data.json())
    .then(result => nameText.innerHTML = result.username)
}

function logout() {
    fetch("/logout").then(window.location.href="/login")
}
