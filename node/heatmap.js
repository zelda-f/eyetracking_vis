//TODO - get the screen width and height dynamically
//TODO SCALE THE DATA TO FIT TINY SCREEN
//TODO - get the participant inhi and WM dynamically, add drop downs
//TODO - add drop down menus for the HOO and C and S

const width = 600;
const height = 300;
const middle_x = width * 0.5 - 130;

const aoiColorScale = d3.scaleOrdinal()
  .domain(["HOSide", "HOO", "LOSide", "LOO"])
  .range(["purple", "blue", "orange", "green"]);

const stimuli_R = [
  { src: "stimuli/3.png", x: middle_x + 150, y: height * .2 },
  { src: "stimuli/6.png", x: middle_x, y: height * .2 },
  { src: "stimuli/9.png", x: middle_x - 150, y: height * .2 },
  { src: "stimuli/add.png", x: middle_x - 80, y: height * .2 },
  { src: "stimuli/div.png", x: middle_x + 80, y: height * .2 }
];

const stimuli_L = [
    { src: "stimuli/9.png", x: middle_x + 150, y: height * .2 },
    { src: "stimuli/3.png", x: middle_x, y: height * .2 },
    { src: "stimuli/6.png", x: middle_x - 150, y: height * .2 },
    { src: "stimuli/div.png", x: middle_x - 80, y: height * .2 },
    { src: "stimuli/add.png", x: middle_x + 80, y: height * .2 }
  ];

  // Add stimuli images
function add_stimuli(svg, stimuli){
    stimuli.forEach(stimulus => {
        svg.append("image")
          .attr("xlink:href", stimulus.src)
          .attr("x", stimulus.x)
          .attr("y", stimulus.y)
          .attr("height", .3 * height)
          .attr("width", .35 * width);
      });

  }

// Fetch all CSV files from the server
fetch('/api/files')
  .then(res => res.json())
  .then(files => {
    files.forEach((filename, i) => {
      d3.csv(`AOI_hit/${filename}`, d => ({
        timestamp: +d.timestamp,
        x: +d.x * .4,
        y: +d.y * .35,
        Trackloss: d.Trackloss?.trim().toLowerCase(),
        Hit_AOIs: d.Hit_AOIs ? d.Hit_AOIs.split(",").map(a => a.trim()) : [],
        Problem_id: d.Problem_id,
      })).then(data => {
        const filtered = data.filter(d => d.Trackloss !== "missing" && d.Problem_id.includes("_R"));
        renderChart(filtered, filename, i);
      });
    });
  });

function renderChart(data, title, index) {
  var HOO = "right"
  const container = d3.select("#container")
    .append("div")
    .attr("class", "chart-wrapper");

  container.append("h4").text(title);

  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height);

  const contours = d3.contourDensity()
    .x(d => d.x)
    .y(d => d.y)
    .size([width, height])
    .bandwidth(20)
    .thresholds(10)
    (data);

  const color = d3.scaleSequential(d3.interpolateRdBu)
    .domain(d3.extent(contours, d => d.value))
    .nice();

  svg.append("g")
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-linejoin", "round")
    .selectAll("path")
    .data(contours)
    .join("path")
    .attr("stroke-width", (d, i) => i % 5 ? 0.25 : 1)
    .attr("d", d3.geoPath())
    .attr("fill", d => color(d.value))
    .attr("fill-opacity", 0.7);

  add_stimuli(svg, HOO == "right" ? stimuli_R : stimuli_L);

}
