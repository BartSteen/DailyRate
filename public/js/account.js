//get the data of the user currently logged in
async function getUserData() {
    const response = await fetch("/user", {
        headers: {
            'Content-type': 'application/json'
        }
    })
    const jsonRes = await response.json();

    return jsonRes;
}
