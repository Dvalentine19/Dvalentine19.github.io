let currentYear = 'ALL';
let currentLeague = '';
let scatterData = {};

const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

margin = {
    top: 10,
    right: 40,
    bottom: 40,
    left: 40,
};

width = 1000 - margin.left - margin.right;
height = 500 - margin.top - margin.bottom;

svg = d3.select('#scatter')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom + 20)
    .append('g')
    .attr('transform', `translate(${margin.left + 30}, ${margin.top})`);

function chooseYear(year) {
    currentYear = year;
    if (currentYear == 'ALL'){
        d3.csv(`data/${currentYear}_fifa.csv`, (d) => ({
            name: d.name,
            year: currentYear,
            rank: +d.rank,
            overall: +d.overall,
            potential: +d.potential,
            position: d.position,
            age: +d.age,
            club: d.club,
            league: d.league,
            nation: d.nation,
        }))
        .then((data) => {
            scatterData[currentYear] = data.slice(0, 250);

            updateScatterplot();
        })
    }

    //lololololofdfdfdf
    else{
        d3.csv(`data/${currentYear}_fifa.csv`, (d) => ({
            name: d.name,
            year: currentYear,
            rank: +d.rank,
            overall: +d.overall,
            potential: +d.potential,
            position: d.position,
            age: +d.age,
            club: d.club,
            league: d.league,
            nation: d.nation,
        }))
        .then((data) => {
            scatterData[currentYear] = data.slice(0, 50);

            updateScatterplot();
        })
    }
}


function updateLeagueData(selectedLeague) {
    selectedLeague = selectedLeague || currentLeague;
    currentLeague = selectedLeague;

    const filteredData = scatterData[currentYear].filter((d) => d.league === selectedLeague).slice(0, 50);

    updateScatterplot(filteredData);
}

function resetLeague() {
    currentLeague = '';

    updateScatterplot(scatterData[currentYear]);
}

function updateScatterplot(data) {
    svg.selectAll('*').remove();

    const xScale = d3.scaleLinear()
        .domain([50, 100])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([50, 100])
        .range([height, 0]);

    const tooltip = d3.select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('visibility', 'hidden')
        .style('background-color', 'rgba(0, 0, 0, 0.8)')
        .style('color', '#fff')
        .style('padding', '5px')
        .style('border-radius', '5px')
        .style('font-size', '12px');

    svg.selectAll('circle')
        .data(data || scatterData[currentYear])
        .enter()
        .append('circle')
        .attr('cx', (d) => xScale(d.overall))
        .attr('cy', (d) => yScale(d.potential))
        .attr('r', 5)
        .style('fill', (d) => colorScale(d.league))
        .on('mouseover', (event, d) => {
            tooltip.style('visibility', 'visible')
                .html(
                    `<strong>${d.name}</strong><br>
                    League: ${d.league}<br>
                    Club: ${d.club}<br>
                    Position: ${d.position}<br>
                    Overall: ${d.overall}<br>
                    Potential: ${d.potential}<br>
                    Rank: ${d.rank}`
                )
                .style('left', `${event.pageX + 10}px`)
                .style('top', `${event.pageY - 10}px`);
        })
        .on('mouseout', () => {
            tooltip.style('visibility', 'hidden');
        });

    svg.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));

    svg.append('g')
        .call(d3.axisLeft(yScale));

    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + (margin.bottom + 5))
        .attr('text-anchor', 'middle')
        .text('Overall Rating');

    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -margin.left)
        .attr('text-anchor', 'middle')
        .text('Potential Rating');
    

    // double check this POSSIBLE ERROR not sure how it will look
    svg.append('text')
        .attr('id', 'scatterplot-title')
        .attr('x', width / 2)
        .attr('y', 8)
        .attr('text-anchor', 'middle')
        .style('font-size', '24px')
        .style('font-weight', 'bold')
        .text(`Top FIFA Players: ${currentYear}`);


    const legendDiv = document.getElementById('legend');
    legendDiv.innerHTML = '';

    const leagues = [...new Set(scatterData[currentYear].map((d) => d.league))];

    leagues.sort().forEach((league) => {
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';

        const legendColor = document.createElement('div');
        legendColor.className = 'legend-color';
        legendColor.style.backgroundColor = colorScale(league);

        const legendLabel = document.createElement('div');
        legendLabel.textContent = league;

        legendItem.appendChild(legendColor);
        legendItem.appendChild(legendLabel);

        legendItem.addEventListener('click', () => {
            updateLeagueData(league);
        });

        legendDiv.appendChild(legendItem);
    });

    const legendHeight = legendDiv.offsetHeight;
    svg.attr('height', Math.max(height + margin.top + margin.bottom, legendHeight));

    d3.selectAll('.annotation-group').remove();

    svg.select('#scatterplot-title')
    .text(`Year ${currentYear}`);

    if (currentYear === 'ALL') {
        const annotationsall = [{
            note: {
                title: "Top-Performing Universities",
                label: 'This cluster highlights the universities with high Research and Teaching score through 2020-2024. Notice the consistency of the top ranked universities.',
                wrap: 300,
            },
            connector: {
                end: 'arrow',
            },
            x: width -170,
            y: 80,
            dx: -50,
            dy: 250,
        }, ];

        const annotationall = d3.annotation().type(d3.annotationCallout).annotations(annotationsall);
        svg.append('g').attr('class', 'annotation-group').call(annotationall);

    } else if (currentYear === '2020') {
        const annotations2020 = [{
            note: {
                title: 'Chinese Universities',
                label: 'Notice the top Chinese Universities are relatively close to each other and are fairing pretty well with other top-performing universities.',
                wrap: 260,
            },
            connector: {
                end: 'arrow',
            },
            x: width -200,
            y: 105,
            dx: -10,
            dy: 140,
        }, ];

        const annotation2020 = d3.annotation().type(d3.annotationCallout).annotations(annotations2020);
        svg.append('g').attr('class', 'annotation-group').call(annotation2020);
    } else if (currentYear === '2021') {
        const annotations2021 = [{
            note: {
                title: 'Japan Anomaly',
                label: 'University of Tokyo scored a very high research and teaching metrics for this year with just an overall score of 76. One of few countries witin the Top-Performing University Cluster',
                wrap: 200,
            },
            connector: {
                end: 'arrow',
            },
            x: width -225,
            y: 95,
            dx: 10,
            dy: 140,
        }, ];

        const annotation2021 = d3.annotation().type(d3.annotationCallout).annotations(annotations2021);
        svg.append('g').attr('class', 'annotation-group').call(annotation2021);

    } else if (currentYear === '2022') {
        const annotations2022 = [{
            note: {
                title: 'Lowest Score of 2022',
                label: 'Chinese University of Hong Kong has the lowest score with a score of 71.3',
                wrap: 500,
            },
            connector: {
                end: 'arrow',
            },
            x: width -820,
            y: 375,
            dx: 120,
            dy: 20,
        }, ];

        const annotation2022 = d3.annotation().type(d3.annotationCallout).annotations(annotations2022);
        svg.append('g').attr('class', 'annotation-group').call(annotation2022);
    }  else if (currentYear === '2023') {
        const annotations2023 = [{
            note: {
                title: 'Best University',
                label: 'Oxford University has consistently and notably scored as the highest overall university from 2020-2023 so far.',
                wrap: 300,
            },
            connector: {
                end: 'arrow',
            },
            x: width -140,
            y: 10,
            dx: -10,
            dy: 280,
        }, ];

        const annotation2023 = d3.annotation().type(d3.annotationCallout).annotations(annotations2023);
        svg.append('g').attr('class', 'annotation-group').call(annotation2023);
    }   else if (currentYear === '2024') {
        const annotations2024 = [{
            note: {
                title: "UIUC's Record-Breaking Year",
                label: 'UIUC achieved an overall score of 77.9, which is the highest score out of all years',
                wrap: 250,
            },
            connector: {
                end: 'arrow',
            },
            x: width -560,
            y: 175,
            dx: 0,
            dy: 130,
        }, ];

        const annotation2024 = d3.annotation().type(d3.annotationCallout).annotations(annotations2024);
        svg.append('g').attr('class', 'annotation-group').call(annotation2024);
    }
}
chooseYear('ALL');