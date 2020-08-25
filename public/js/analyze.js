let visColour = '#88e645'; //general accent colour of the visualizations
let daysInWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];


//initiates all the analyses/visualizations
async function initialAnalysis() {
    //get the ratings in different formats
    let ratings = await getAllRatingData(); // array of json of date string - ratings
    setTextualInfo(ratings);

    showRatingsList(ratings);

    //visualization
    visBar(ratings);
    visBoxPlot(ratings)
    visTimePlot(ratings)

    visAverageDay(ratings)
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

//returns an array with only the ratings
function getScores(ratings) {
    let vals = [];
    for (i = 0; i < ratings.length; i++) {
        vals.push(ratings[i].rating);
    }
    return vals;
}

//returns an array with jsons with date objects and their ratings
function getDateObjArray(ratings) {
    let dateRatings = []
    for (i = 0; i < ratings.length; i++) {
        let curDate = ratings[i].date;
        let year = curDate.split("-")[2];
        let month = curDate.split("-")[1] - 1;
        let day = curDate.split("-")[0];
        dateRatings.push({date: new Date(year, month, day), rating: ratings[i].rating})
    }
    return dateRatings;
}

//returns array of json with day of week - sum of ratings on that day- n of ratings
function getWeekDayAverages(ratings) {
    let datedRatings = getDateObjArray(ratings);
    let sumRatings = [];
    let count = [];

    //init all days at 0
    for (i = 0; i < daysInWeek.length; i++) {
        sumRatings.push(0);
        count.push(0)
    }

    for (i = 0; i < datedRatings.length; i++) {
        let day = datedRatings[i].date.getDay();
        sumRatings[day] += datedRatings[i].rating
        count[day] += 1;
    }

    let averages = []
    for (i = 0; i < sumRatings.length; i++) {
        if (count[i] == 0) {
            averages.push(0);
        } else {
            averages.push(sumRatings[i] / count[i])
        }
    }
    return averages
}

//returns a json with each score counted in how much it is in the ratings
function countScores(ratings) {
    let counting = {1: 0, 2: 0, 3: 0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, 10:0}
    for (i = 0; i < ratings.length; i++) {
        counting[ratings[i].rating] += 1;
    }
    return counting;
}

//returns the average of the array
function calculateAverage(ratings) {
    let sum = 0;
    for (i = 0; i < ratings.length; i++) {
        sum += ratings[i].rating;
    }
    return sum / ratings.length;
}

//gets the max of and non-negative containing array
function getMaxCount(counts) {
    let max = 0;
    for (i in counts) {
        max = Math.max(max, counts[i])
    }
    return max;
}

function setTextualInfo(ratings) {
    let average = calculateAverage(ratings);
    document.getElementById("amountText").innerHTML = ratings.length;
    document.getElementById("averageText").innerHTML = Math.round(average * 100)/100;
}

//shows the ratings in the list
function showRatingsList(ratings) {
    //sort the ratings
    let sortedRatings = ratings.sort(function(a, b) {
         let aSep = a.date.split("-");
         let bSep = b.date.split("-");
         return new Date(aSep[2], aSep[1], aSep[0]) - new Date(bSep[2], bSep[1], bSep[0])
     })


    let ulist = document.getElementById('ratingsList');
    for (let i = 0; i < sortedRatings.length; i++) {
        let item = document.createElement('li');
        item.innerHTML = sortedRatings[i].date + "  |   " + sortedRatings[i].rating;
        item.setAttribute('class', 'listItem');
        ulist.appendChild(item);
    }
}

//bar plot visualizatoin
function visBar(ratings) {
    let svg = d3.select("#barSvg");
    let margin = 30;
    let height = svg.attr("height") - 2 * margin;
    let width = svg.attr("width") - 2 * margin

    //get space with margins taken off
    let chart = svg.append('g')
        .attr('transform', `translate(${margin}, ${margin})`)

    //get data in proper format
    let counts = countScores(ratings);

    let maxY = getMaxCount(counts)

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
            .attr('height', Math.max(height - yScale(counts[i]) - 1, 0))
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

//visualize a box plot
function visBoxPlot(ratings) {
    let svg = d3.select("#boxPlotSvg");
    let margin = 30;
    let height = svg.attr("height") - 2 * margin;
    let width = svg.attr("width") - 2 * margin;

    //get space with margins taken off
    let chart = svg.append('g')
        .attr('transform', `translate(${margin}, ${margin})`)

    //get data in proper formats
    let scores = getScores(ratings);

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

    //draw main line
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
    chart.selectAll('idk')
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

//visualize the over time ratings plot
function visTimePlot(ratings) {
    let svg = d3.select("#datePlotSvg");
    let margin = 30;
    let height = svg.attr("height") - 2 * margin;
    let width = svg.attr("width") - 2 * margin;

    //get space with margins taken off
    let chart = svg.append('g')
        .attr('transform', `translate(${margin}, ${margin})`);

    //get proper data formats
    let dateRatings = getDateObjArray(ratings)

    //sort the array
    dateRatings.sort((a, b) => a.date - b.date)

    //get the scales
    let xScale = d3.scaleTime()
            .domain(d3.extent(dateRatings, function(d) {
                return d.date
            }))
            .range([0, width]);

    let yScale = d3.scaleLinear()
                .domain([0, 10])
                .range([height, 0]);

    //add the axis
    chart.append("g")
        .attr('transform', 'translate(0, ' + height +  ')')
        .attr('class', 'axis')
        .call(d3.axisBottom(xScale));

    chart.append("g")
        .attr('class', 'axis')
        .call(d3.axisLeft(yScale));

    //add the line
    chart.append("path")
      .datum(dateRatings)
      .attr("fill", "none")
      .attr("stroke", visColour)
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(function(d) { return xScale(d.date) })
        .y(function(d) { return yScale(d.rating) }))

    //labels
    svg.append('text')
        .attr('x', -(height / 2) - margin)
        .attr('y', margin / 2.4)
        .attr('fill', '#ffffff')
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .text('Rating')

    svg.append('text')
        .attr('x', width / 2 + margin)
        .attr('fill', '#ffffff')
        .attr('y', height + 2 * margin)
        .attr('text-anchor', 'middle')
        .text('Date')
}

function visAverageDay(ratings) {
    let svg = d3.select("#averageDaySvg");
    let margin = 30;
    let height = svg.attr("height") - 2 * margin;
    let width = svg.attr("width") - 2 * margin;

    //get space with margins taken off
    let chart = svg.append('g')
        .attr('transform', `translate(${margin}, ${margin})`);

    //get data in proper format
    weekDayAverages = getWeekDayAverages(ratings)

    //x and y scale
    const xScale = d3.scaleBand()
                    .domain(daysInWeek)
                    .range([0, width])
                    .padding(0.25)

    const yScale = d3.scaleLinear()
                    .domain([0, 10])
                    .range([height, 0]);

    //add the axis
    chart.append("g")
        .attr('transform', 'translate(0, ' + height +  ')')
        .attr('class', 'axis')
        .call(d3.axisBottom(xScale));

    chart.append("g")
        .attr('class', 'axis')
        .call(d3.axisLeft(yScale)
        .ticks(10)
        .tickFormat(d3.format('d')));

        //horizontal grid
        chart.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft()
            .scale(yScale)
            .ticks(10)
            .tickSize(-width, 0, 0)
            .tickFormat(''))

    //add bars
        chart.append('g').selectAll('idk')
        .data(weekDayAverages)
        .enter()
        .append('rect')
        .attr('x', function(d, i) {return xScale(daysInWeek[i])})
        .attr('y', function(d) {return yScale(d) + 1})
            .attr('height', function(d) {return Math.max(height - yScale(d) - 1, 0)})
            .attr('width', xScale.bandwidth())
            .attr('fill', visColour)
            .attr('stroke', 'white')
            .append("title")
		        .text(function(d) {return d})

    //total average line
    let average = calculateAverage(ratings);
    chart.append('line')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', yScale(average))
        .attr('y2', yScale(average))
        .attr('stroke', 'orange')
        .attr('stroke-dasharray', 5)

    //labels
    svg.append('text')
        .attr('x', -(height / 2) - margin)
        .attr('y', margin / 2.4)
        .attr('fill', '#ffffff')
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .text('Day')

    svg.append('text')
        .attr('x', width / 2 + margin)
        .attr('fill', '#ffffff')
        .attr('y', height + 2 * margin)
        .attr('text-anchor', 'middle')
        .text('Average Rating')
}
