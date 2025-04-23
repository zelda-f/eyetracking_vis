//TODO - get the screen width and height dynamically
//TODO - get the participant inhi and WM dynamically, add drop downs

// TODO -- create an update function that doesnt utilize the fetch functiona and simply updates the data in a filter function.

const width = 600;
const height = 300;
const middle_x = width * 0.5 - 130;

// create dropdowns
var selectedHOO = "R";
var selectedS = "";
var selectedC = "";
// HOO dropdown
const HOO_options = ["R", "L"];
d3.select("#HOO_button")
  .selectAll("HOO Options")
  .data(HOO_options)
  .enter()
  .append("option")
  .text(function (d) { return d; }) 
  .attr("value", function (d) { return d; });

d3.select("#HOO_button").on("change", function(d){
  selectedHOO = d3.select(this).property("value"); // get the selected HOO from the drop down
  console.log("hoo changed to ", selectedHOO)
  getFiles(selectedHOO);
})

// Spacing dropdown
const S_options = ["No Spacing Filter", "Congruent Spacing", "Neutral Spacing", "Incongruent Spacing"]
d3.select("#S_button")
  .selectAll("S Options")
  .data(S_options)
  .enter()
  .append("option")
  .text(function (d) { return d; }) 
  .attr("value", function (d) { return d; });

d3.select("#S_button").on("change", function(d){
  var selectedS = function(e) {
    var s = d3.select(this).property("value")
    if (s == S_options[0]) {
      return ""
    }
    if (s == S_options[1]) {
      return "CS"
    }
    if (s == S_options[2]) {
      return "NS"
    }
    else {
      return "IS"
    }
  }; // get the selected HOO from the drop down
  console.log("S changed to ", selectedS)
  filter(selectedHOO, selectedS, selectedC);
})

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
function getFiles(HOO) {
  d3.select("#container").selectAll("*").remove();
  console.log(HOO)
// Fetch all CSV files from the server
  fetch('/api/files')
  .then(res => res.json())
  .then(files => {
    console.log("got files")
    files.forEach((filename, i) => {
      filter("R", "", "")
    });
  });
}

function filter(HOO, S, C) {
  files.forEach(f, i => {
    d3.csv(`AOI_hit/${filename}`, d => ({
      timestamp: +d.timestamp,
      x: +d.x * .4,
      y: +d.y * .35,
      Trackloss: d.Trackloss?.trim().toLowerCase(),
      Hit_AOIs: d.Hit_AOIs ? d.Hit_AOIs.split(",").map(a => a.trim()) : [],
      Problem_id: d.Problem_id,
    })).then(data => {
      const filtered = data.filter(d => d.Trackloss !== "missing" 
        && d.Problem_id.includes(HOO, S, C));
      if (i == 1) {
        console.log(filtered);
      }
      renderChart(filtered, filename, HOO, i);
    });
    
  });
}


function renderChart(data, title, HOO, index) {
// filter in this function?
// save all the files so i dont have to fetch them, then loop through w the filter?

  //var HOO = "right"
  if (index == 1) {
    console.log(HOO)
  }
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

  add_stimuli(svg, HOO == "R" ? stimuli_R : stimuli_L);

}
