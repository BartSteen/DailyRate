async function initialAnalysis() {
    let ratings = await getAllRatingData();
    let scores = getScores(ratings);
    let average = calculateAverage(scores);
    document.getElementById("amountText").innerHTML = scores.length;
    document.getElementById("averageText").innerHTML = Math.round(average * 100)/100;

    //visualization
    visBar(scores);
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

function visBar(scores) {
    let svg = d3.select("#barSvg");
    let margin = 50;
    let height = svg.attr("height") - 2 * margin;
    let width = svg.attr("width") - 2 * margin;


    let counts = countScores(scores);
    let maxY = getMaxCount(counts)

    let chart = svg.append('g')
        .attr('transform', `translate(${margin}, ${margin})`)


    const xScale = d3.scaleBand()
                    .range([0, width])
                    .domain(Object.keys(counts))
                    .padding(0.2);

    const yScale = d3.scaleLinear()
                    .domain([0, maxY])
                    .range([height, 0]);

    chart.append("g")
        .attr('transform', 'translate(0, ' + height +  ')')
        .attr('class', 'axis')
        .call(d3.axisBottom(xScale));

    chart.append("g")
        .attr('class', 'axis')
        .call(d3.axisLeft(yScale)
        .ticks(Math.min(maxY, 10))
        .tickFormat(d3.format('d')));

        //horizontal grid
        chart.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft()
            .scale(yScale)
            .ticks(Math.min(maxY, 10))
            .tickSize(-width, 0, 0)
            .tickFormat(''))

    //add bars
    for (i in counts) {
        let n = i;
        chart.append('rect')
            .attr('x', xScale(i))
            .attr('y', yScale(counts[i]))
            .attr('height', height - yScale(counts[i]))
            .attr('width', xScale.bandwidth())
            .attr('fill', '#7eedac')
            .append("title")
		        .text(counts[n])
    }

    //labels
    svg.append('text')
    .attr('x', -(height / 2) - margin)
    .attr('y', margin / 2.4)
    .attr('fill', '#ffffff')
    .attr('transform', 'rotate(-90)')
    .attr('text-anchor', 'middle')
    .text('Amount')

svg.append('text')
    .attr('x', width / 2 + margin)
    .attr('fill', '#ffffff')
    .attr('y', height + 2 * margin)
    .attr('text-anchor', 'middle')
    .text('Rating')

}

function countScores(scores) {
    let counting = {1: 0, 2: 0, 3: 0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, 10:0}
    for (i = 0; i < scores.length; i++) {
        counting[scores[i]] += 1;
    }
    return counting;
}

function getMaxCount(counts) {
    let max = 0;
    for (i in counts) {
        max = Math.max(max, counts[i])
    }
    return max;
}
