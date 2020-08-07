async function initialAnalysis() {
    let ratings = await getAllRatingData();
    let scores = getScores(ratings);
    let average = calculateAverage(scores);
    document.getElementById("amountText").innerHTML = scores.length;
    document.getElementById("averageText").innerHTML = Math.round(average * 100)/100;
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

function calculateAverage(scores) {
    let sum = 0;
    for (i = 0; i < scores.length; i++) {
        sum += scores[i];
    }
    return sum / scores.length;
}

function getScores(ratings) {
    let vals = [];
    for (i = 0; i < ratings.length; i++) {
        vals.push(ratings[i].rating);
    }
    return vals;
}
