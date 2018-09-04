/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 2 - Gapminder Clone
*/

const t = d3.transition().duration(10);
const numberFormat = new Intl.NumberFormat('en-US').format;

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

const gRoot = d3.select('#chart-area')
  .append('svg')
  .attrs({ height, width })
.append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

const gXAxis = gRoot.append('g')
  .attr('transform', `translate(0, ${innerHeight})`);
const gYAxis = gRoot.append('g');

// Scales
const yScale = d3.scaleLinear()
  .range([innerHeight, 0]);

const xScale = d3.scaleLog()
	.range([0, innerWidth]);

const continentsScale = d3.scaleOrdinal(d3.schemeSet3);

const areaScale = d3.scaleLinear().range([2, 35]);

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

d3.json('data/data.json').then((data) => {
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

	continentsScale.domain(
		data[0].countries
			.map((country) => country.continent)
			.filter((item, idx, arr) => arr.indexOf(item) === idx)
	);

	console.log(data[0].countries
		.map((country) => country.continent)
		.filter((item, idx, arr) => arr.indexOf(item) === idx));

  const yAxis = d3.axisLeft(yScale);
	const xAxis = d3.axisBottom(xScale);
	xAxis.tickValues([400, 4000, 40000]).tickFormat((d) => numberFormat(d));
	
	gXAxis.call(xAxis);
	gYAxis.call(yAxis);

	let dataIndex = 0;

	d3.interval(() => {
		dataIndex = (dataIndex + 1) % data.length;
		update(data[dataIndex])
	}, 200);

	update(data[dataIndex]);
});

function update(data) {
	// Set domain of scale for circle size
	areaScale.domain(d3.extent(
		data.countries.map((country) => Math.sqrt(country.population) / Math.PI)
	));

	// set year text
	yearText.text(data.year);

	const cCountries = gRoot
    .selectAll('circle')
		.data(data.countries.filter((country) => country.income && country.life_exp), (d) => d.country);
		
	cCountries.exit().remove();

	cCountries
		.enter()
		.append('circle')
			.attr('fill', (d) => continentsScale(d.continent))
		.merge(cCountries)
			.transition(t)
			.attrs({
				cx: (d) => xScale(d.income),
				cy: (d) => yScale(d.life_exp),
				r: (d) => areaScale(Math.sqrt(d.population) / Math.PI),
			});
}