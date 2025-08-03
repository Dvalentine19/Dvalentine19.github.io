let currentYear = 'ALL';
let currentLeague = '';
let currentPosition = 'ALL';  // or '', either works, just be consistent!
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

function updatePositionData(selectedPosition) {
    currentPosition = selectedPosition || currentPosition;
    updateScatterplot();
}

function resetPosition() {
    currentPosition = 'ALL';
    updateScatterplot();
}


function updateScatterplot(data) {
    svg.selectAll('*').remove();

      // Apply both league and position filters
      let plotData = data || scatterData[currentYear];
      if (currentLeague) {
          plotData = plotData.filter(d => d.league === currentLeague);
      }
      if (currentPosition && currentPosition !== 'ALL') {
          plotData = plotData.filter(d => d.position === currentPosition);
      }

    const xScale = d3.scaleLinear()
        .domain([86, 95])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([86, 98])
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
        .data(plotData)
        .enter()
        .append('circle')
        .attr('cx', (d) => xScale(d.overall) + (Math.random() - 0.5) * 17)
        .attr('cy', (d) => yScale(d.potential) + (Math.random() - 0.5) * 17)
        .attr('r', 4)
        .style('fill', (d) => colorScale(d.league))
        .on('mouseover', (event, d) => {
            tooltip.style('visibility', 'visible')
                .html(
                    `<strong>${d.name}</strong><br>
                    League: ${d.league}<br>
                    Club: ${d.club}<br>
                    Position: ${d.position}<br>
                    Overall: ${d.overall}<br>
                    Age: ${d.age}<br>
                    Nation: ${d.nation}<br>
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

    svg.selectAll('.tick text')
        .style('font-size', '18px')
        .style('fill', '#003366');

    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + (margin.bottom + 5))
        .attr('text-anchor', 'middle')
        .style('font-size', '20px')             // Bigger font
        .style('font-weight', 'bold')
        .style('fill', '#003366') 
        .text('Overall Rating');

    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -margin.left)
        .attr('text-anchor', 'middle')
        .style('font-size', '20px')             // Bigger font
        .style('font-weight', 'bold')
        .style('fill', '#003366') 
        .text('Potential Rating');
    

    // double check this POSSIBLE ERROR not sure how it will look
    svg.append('text')
        .attr('id', 'scatterplot-title')
        .attr('x', width / 2)
        .attr('y', 14) // move a bit lower if needed
        .attr('text-anchor', 'middle')
        .style('font-size', '30px')
        .style('font-weight', 'bold')
        .style('fill', '#003366') // dark blue
        .text(currentYear === 'ALL' ? 'Years 2018–2024' : `Year ${currentYear}`);


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

// --- POSITION LEGEND ---
    const positionLegendDiv = document.getElementById('position-legend');
    positionLegendDiv.innerHTML = '';

    const positions = [...new Set(plotData.map(d => d.position))];
    positions.sort().forEach((position) => {
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';

        // Just the position name, no color box:
        const legendLabel = document.createElement('div');
        legendLabel.textContent = position;
        legendLabel.style.cursor = "pointer";

        legendItem.appendChild(legendLabel);

        legendItem.addEventListener('click', () => {
            updatePositionData(position);
    });

    positionLegendDiv.appendChild(legendItem);
});


    const legendHeight = legendDiv.offsetHeight;
    svg.attr('height', Math.max(height + margin.top + margin.bottom, legendHeight));

    d3.selectAll('.annotation-group').remove();

    //svg.select('#scatterplot-title')
    //.text(`Year ${currentYear}`);

    if (currentYear === 'ALL') {           
    
        const annotationsall = [{
            note: {
                title: "Messi & Ronaldo: The GOAT Era",
                label: "Lionel Messi and Cristiano Ronaldo hold the all-time records for Ballon d'Or wins (8 for Messi, 5 for Ronaldo), goals, and assists. They are the only players in history to have a 94 Overall Rating in FIFA, cementing their legendary status.",
                wrap: 340,
            },
            connector: {
                end: 'arrow',
            },
            x: xScale(94),
            y: yScale(94),
            dx: -20,
            dy: 160,  // Pushes the annotation box downward
        }];
    
        const annotationall = d3.annotation().type(d3.annotationCallout).annotations(annotationsall);
        svg.append('g').attr('class', 'annotation-group').call(annotationall);
    
    
    } else if (currentYear === '2018') {

        const annotations2018 = [{
            note: {
                title: "Ronaldo’s Real Madrid Farewell",
                label: "Ronaldo ended his Real Madrid era with a 44-goal season, another Champions League title, and Portugal’s first major trophy. 2018 marked his final year before joining Juventus.",
                wrap: 300,
            },
            connector: { end: 'arrow' },
            x: xScale(94),
            y: yScale(94),
            dx: -50,
            dy: 140,
        }];
    
        const annotation2018 = d3.annotation().type(d3.annotationCallout).annotations(annotations2018);
        svg.append('g').attr('class', 'annotation-group').call(annotation2018);
    

    } else if (currentYear === '2019') {
        const annotations2019 = [{
            note: {
                title: "Messi Wins Sixth Ballon d'Or",
                label: "Messi claimed his record-breaking sixth Ballon d'Or in 2019, leading Barcelona with 51 goals in all competitions and earning the highest rating in FIFA.",
                wrap: 260,
            },
            connector: {
                end: 'arrow',
            },
            x: xScale(94),
            y: yScale(94),
            dx: -50,
            dy: 140,
        }, ];

        const annotation2019 = d3.annotation().type(d3.annotationCallout).annotations(annotations2019);
        svg.append('g').attr('class', 'annotation-group').call(annotation2019);

    } else if (currentYear === '2020') {
        const annotations2020 = [{
            note: {
                title: "Liverpool's Champions League Triumph",
                label: "Liverpool won the 2019 Champions League, and by 2020, several of their stars: Van Dijk, Salah, Mané, and Alisson ranked among FIFA's best players, marking a golden era for the club.",
                wrap: 320,
            },
            connector: {
                end: 'arrow',
            },
            x: xScale(90),
            y: yScale(91),
            dx: 150,
            dy: 65,
        }, ];

        const annotation2020 = d3.annotation().type(d3.annotationCallout).annotations(annotations2020);
        svg.append('g').attr('class', 'annotation-group').call(annotation2020);

    } else if (currentYear === '2021') {
        const annotations2021 = [{
            note: {
                title: "Lewandowski & The Veteran Surge",
                label: "Robert Lewandowski broke Gerd Müller's Bundesliga goal record and was FIFA's highest-rated striker. 2021 also saw a record number of players over age 30 in the top 30, proving experience still dominates at the highest level.",
                wrap: 330,
            },
            connector: {
                end: 'arrow',
            },
            x: xScale(91),
            y: yScale(91),
            dx: 90,
            dy: 45,
        }, ];

        const annotation2021 = d3.annotation().type(d3.annotationCallout).annotations(annotations2021);
        svg.append('g').attr('class', 'annotation-group').call(annotation2021);

    } else if (currentYear === '2022') {
        const annotations2022 = [{
            note: {
                title: "Messi's World Cup Triumph",
                label: "Lionel Messi led Argentina to victory in the 2022 World Cup, earning the Golden Ball and cementing his legacy as one of the greatest players in football history.",
                wrap: 300,
            },
            connector: {
                end: 'arrow',
            },
            x: xScale(93),
            y: yScale(93),
            dx: -45,
            dy: 130,
        }, ];

        const annotation2022 = d3.annotation().type(d3.annotationCallout).annotations(annotations2022);
        svg.append('g').attr('class', 'annotation-group').call(annotation2022);

    }  else if (currentYear === '2023') {
        const annotations2023 = [{
            note: {
                title: "Haaland's Historic Run",
                label: "Erling Haaland broke the Premier League single-season goal record in 2023, scoring 36 goals for Manchester City and establishing himself among the top FIFA-rated players. First time top 30 player from a none top 5 league.",
                wrap: 310,
            },
            connector: {
                end: 'arrow',
            },
            x: xScale(89),
            y: yScale(94),
            dx: 200,
            dy: 140,
        }, ];

        const annotation2023 = d3.annotation().type(d3.annotationCallout).annotations(annotations2023);
        svg.append('g').attr('class', 'annotation-group').call(annotation2023);
    }   else if (currentYear === '2024') {
        const annotations2024 = [{
            note: {
                title: "Mbappe's Record Debut",
                label: "Kylian Mbappé shattered records in his debut Real Madrid season, scoring 44 goals and achieving the highest FIFA potential rating ever. 2024 also marks the first time a player from MLS made the top 30.",
                wrap: 280,
            },
            connector: {
                end: 'arrow',
            },
            x: xScale(91),
            y: yScale(97),
            dx: 80,
            dy: 160,
        }, ];

        const annotation2024 = d3.annotation().type(d3.annotationCallout).annotations(annotations2024);
        svg.append('g').attr('class', 'annotation-group').call(annotation2024);
    }
}
chooseYear('ALL');