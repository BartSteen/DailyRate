let visColour = '#7eedac';

async function initialAnalysis() {
    let ratings = await getAllRatingData();
    let scores = getScores(ratings);
    let average = calculateAverage(scores);
    document.getElementById("amountText").innerHTML = scores.length;
    document.getElementById("averageText").innerHTML = Math.round(average * 100)/100;

    //visualization
    let counts = countScores(scores);
    visBar(counts);
    visBoxPlot(scores)
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

function visBar(counts) {
    let svg = d3.select("#barSvg");
    let margin = 50;
    let height = svg.attr("height") - 2 * margin;
    let width = svg.attr("width") - 2 * margin;

    let maxY = getMaxCount(counts)

    //get space with margins taken off
    let chart = svg.append('g')
        .attr('transform', `translate(${margin}, ${margin})`)


    //x and y scale
    const xScale = d3.scaleBand()
                    .range([0, width])
                    .domain(Object.keys(counts))
                    .padding(0.2);

    const yScale = d3.scaleLinear()
                    .domain([0, maxY])
                    .range([height, 0]);

//add the axis
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
            .attr('y', yScale(counts[i]) + 1)
            .attr('height', height - yScale(counts[i]) - 1)
            .attr('width', xScale.bandwidth())
            .attr('fill', visColour)
            .attr('stroke', 'white')
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

function visBoxPlot(scores) {
    let svg = d3.select("#boxPlotSvg");
    let margin = 30;
    let height = svg.attr("height") - 2 * margin;
    let width = svg.attr("width") - 2 * margin;

    //get space with margins taken off
    let chart = svg.append('g')
        .attr('transform', `translate(${margin}, ${margin})`)

    let strokeWidth = 2;
    //interesting data things for which i forgot the collective name
    let sortedScores = scores.sort(d3.ascending)
    let q1 = d3.quantile(sortedScores, .25);
    let median = d3.quantile(sortedScores, .5);
    let q3 = d3.quantile(sortedScores, .75);
    let iqRange = q3 - q1
    let min = sortedScores[0];
    let max = sortedScores[sortedScores.length - 1];
/*
    let min = q1 - 1.5 * iqRange;
    let max = q3 + 1.5 * iqRange;
*/
    //the xScale
    let xScale = d3.scaleLinear()
        .domain([0,10])
        .range([0, width]);

    chart.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(0, ' + height +  ')')
        .call(d3.axisBottom(xScale))

    //draw lines
    chart.append('line')
        .attr('x1', xScale(min))
        .attr('x2', xScale(max))
        .attr('y1', height/2)
        .attr('y2', height/2)
        .attr('stroke', 'white')
        .attr('stroke-width', strokeWidth)

    //draw boxPlotSvg
    chart.append('rect')
        .attr('x', xScale(q1))
        .attr('y', height * 2/6)
        .attr('height', height/3)
        .attr('width', xScale(q3) - xScale(q1))
        .attr('stroke', 'white')
        .attr('stroke-width', strokeWidth)
        .attr('fill', visColour);

    //other lines
    chart.append('g').selectAll('lines')
    .data([min, median, max])
        .enter()
        .append('line')
        .attr('y1', height * 2/6)
        .attr('y2', height * 4/6)
        .attr('x1', function(d) {return xScale(d)})
        .attr('x2', function(d) {return xScale(d)})
        .attr('stroke', 'white')
        .attr('stroke-width', strokeWidth)

    //labels
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
