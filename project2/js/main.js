/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 2 - Gapminder Clone
*/

const numberFormat = new Intl.NumberFormat('en-US').format;
let playing = true;
let dataIndex = 0;
let filteredContinents = [];

const height = 600;
const width = 1150;
const margin = {
  top: 30,
  right: 30,
  bottom: 80,
  left: 80,
};

const innerHeight = height - margin.top - margin.bottom;
const innerWidth = width - margin.left - margin.right;

// Setup range input
const range = document.getElementById('yearRange');
range.addEventListener('input', (e) => {
	// playing = false;
	dataIndex = +e.target.value;
});

// Append root 'g'
const gRoot = d3.select('#chart-area')
  .append('svg')
  .attrs({ height, width })
.append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

// Append legend and set legend rows variable
const legend = gRoot.append('g');
let legendRows;

// Append Axes
const gXAxis = gRoot.append('g')
  .attr('transform', `translate(0, ${innerHeight})`);
const gYAxis = gRoot.append('g');

// Tooltip
const tooltip = d3.tip()
	.attr('class', 'd3-tip')
	.html((d) => {
		return `
			<header style="background-color: ${continentsScale(d.continent)}; color: #333">
				<h4>${d.country}</h4>
			</header>
			<main>
				<p><strong>Population: </strong>${d3.format(',')(d.population)}</p>
				<p><strong>Life Expectancy: </strong>${d.life_exp}</p>
				<p><strong>Income: </strong>${d3.format('$,')(d.income)}</p>
			</main>
		`;
	});
gRoot.call(tooltip);

// Scales
const yScale = d3.scaleLinear()
  .range([innerHeight, 0]);

const xScale = d3.scaleLog()
	.range([0, innerWidth]);

const continentsScale = d3.scaleOrdinal(d3.schemeSet3);

const areaScale = d3.scaleLinear().range([1.4, 35]);

const yearText = gRoot.append('text').attrs({
	x: innerWidth - margin.right,
	y: innerHeight - 25,
	class: 'year-text',
	'text-anchor': 'end',
});

// X Label
gRoot.append('text')
  .attrs({
    x: innerWidth / 2,
    y: innerHeight + 50,
    'text-anchor': 'middle',
  })
  .text('Income (Dollars)');

// Y Label
gRoot.append('text')
  .attrs({
    x: -(innerHeight / 2),
    y: -60,
    'text-anchor': 'middle',
    transform: 'rotate(-90)',
  })
  .text('Life Expectancy');

// Get Data
d3.json('data/data.json').then((data) => {
	// Setup range slider
	range.setAttribute('min', 0);
	range.setAttribute('max', data.length -1);

	// Store array of continents for color scale + legend
	const continents = data[0].countries
		.map((country) => country.continent)
		.filter((item, idx, arr) => arr.indexOf(item) === idx);

	// Set Scale Domains
	yScale.domain(
		d3.extent(
			data.reduce((acc, { countries }) => {
				return acc.concat(countries.map(({ life_exp }) => life_exp));
			}, [])
			.filter((item) => item)
		)
	);

  xScale.domain(
		d3.extent(
			data.reduce((acc, { countries }) => {
				return acc.concat(countries.map(({ income }) => income));
			}, [])
			.filter((item) => item)
		)
	);

	continentsScale.domain(continents);

  const yAxis = d3.axisLeft(yScale);
	const xAxis = d3.axisBottom(xScale);
	xAxis.tickValues([400, 4000, 40000]).tickFormat((d) => numberFormat(d));
	
	gXAxis.call(xAxis);
	gYAxis.call(yAxis);

	// Add Legend
	legend
		.attr('class', 'legend')
		.attr('transform', `translate(${innerWidth - margin.right}, ${innerHeight - 200})`);

	legendRows = legend.selectAll('g')
		.data(continents)
		.enter()
		.append('g')
		.attr('class', 'legend-row')
		.attr('transform', (d, i) => `translate(0, ${i * 24})`)
		.on('click', (d, i, nodes) => {
			const rect = d3.select(nodes[i]).select('rect');
			if (filteredContinents.includes(d)) {
				filteredContinents.splice(filteredContinents.indexOf(d), 1);
				rect.attr('fill', continentsScale(d));
			} else {
				filteredContinents.splice(0, 0, d);
				rect.attr('fill', 'white');
			}
			if (filteredContinents.length === continents.length) {
				filteredContinents = [];
				resetLegend();
			}
			if (!playing) {
				update({
					...data[dataIndex],
					countries: data[dataIndex].countries.filter((country) => !filteredContinents.includes(country.continent)),
				}, d3.extent(
					data[dataIndex].countries.map((country) => Math.sqrt(country.population) / Math.PI)
				));
			}
		});
	legendRows.append('rect')
			.attr('height', 12)
			.attr('width', 12)
			.attr('fill', (d) => continentsScale(d));
	legendRows.append('text')
		.text((d) => d)
		.attr('text-anchor', 'end')
		.attr('class', 'continent')
		.attr('x', -6)
		.attr('y', 11);

	d3.interval(() => {
		if (!playing) {
			return;
		}

		dataIndex = (dataIndex + 1) % data.length;
		range.value = dataIndex;
		update({
			...data[dataIndex],
			countries: data[dataIndex].countries.filter((country) => !filteredContinents.includes(country.continent)),
		}, getAreaScaleDomain(data[dataIndex]));
	}, 200);

	update(data[dataIndex], getAreaScaleDomain(data[dataIndex]));

	// Attach events to buttons
	document.querySelector('.play-pause').addEventListener('click', onPlayPauseClick)
	document.querySelector('.reset').addEventListener('click', onResetClick);
});

function resetLegend() {
	legendRows
		.selectAll('rect')
		.attr('fill', (d) => continentsScale(d));
}

function onPlayPauseClick(e) {
	playing = !playing;
	e.target.innerText = playing ? 'Pause' : 'Play';
}

function onResetClick() {
	filteredContinents = [];
	dataIndex = 0;
	resetLegend();
}

function getAreaScaleDomain(data) {
	return d3.extent(
		data.countries.map((country) => Math.sqrt(country.population) / Math.PI)
	)
}

function update(data, areaScaleDomain) {
	// Set domain of scale for circle size
	areaScale.domain(areaScaleDomain);

	// set year text
	yearText.text(data.year);

	const cCountries = gRoot
    .selectAll('circle')
		.data(data.countries.filter((country) => country.income && country.life_exp), (d) => d.country);
		
	cCountries
		.exit()
		.transition()
		.attr('r', 0)
		.remove();

	cCountries
		.enter()
		.append('circle')
			.attr('fill', (d) => continentsScale(d.continent))
			.on('mouseover', tooltip.show)
			.on('mouseout', tooltip.hide)
		.merge(cCountries)
		.transition()
		.attrs({
			r: (d) => areaScale(Math.sqrt(d.population) / Math.PI),
			cx: (d) => xScale(d.income),
			cy: (d) => yScale(d.life_exp),
		});
}