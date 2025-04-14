// Renders gaze data for one participant when HOO is on the right side

const width = 1536;
const height = 864;
const middle_x = width * 0.5 - 270;

// Create an SVG instead of canvas
const svg = d3.select("#container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background-color", "white");

// Define a color scale for AOIs
const aoiColorScale = d3.scaleOrdinal()
    .domain(["HOSide", "HOO", "LOSide", "LOO"])
    .range(["purple", "blue", "orange", "green"]);


// Add stimuli images
const stimuli = [
    { src: "stimuli/3.png", x: middle_x + 350, y: height * .2 },
    { src: "stimuli/6.png", x: middle_x, y: height * .2 },
    { src: "stimuli/9.png", x: middle_x - 350, y: height * .2 }, 
    { src: "stimuli/add.png", x: middle_x - 175, y: height * .2 },
    { src: "stimuli/div.png", x: middle_x + 175, y: height * .2 }
];

stimuli.forEach(stimulus => {
  svg.append("image")
    .attr("xlink:href", stimulus.src)
    .attr("x", stimulus.x)
    .attr("y", stimulus.y)
    .attr("height", .3*height)
    .attr("width", .35*width);});

function drawHeatmap(data) {

    const contours = d3.contourDensity()
    .x(d => d.x)
    .y(d => d.y)
    .size([width, height])
    .bandwidth(20)
    .thresholds(10)
    (data);

    const color = d3.scaleSequential(d3.interpolateTurbo)
        .domain(d3.extent(data, d => d.x))
        .nice();

    console.log("Contours:", contours);

    svg.append("g")
        .attr("fill", "none")
        //.attr("stroke", color)
        .attr("stroke", "black")
        .attr("stroke-linejoin", "round")
        .selectAll()
        .data(contours)
        .join("path")
        .attr("stroke-width", (d, i) => i % 5 ? 0.25 : 1)
        .attr("d", d3.geoPath())
        .attr("fill", d => color(d.value));
        //function(d) {
        //     console.log(d);
        //     console.log(color);
        //     console.log(color(d.value));
        // });

    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", 0)
        .attr("fill", d => {
            if (d.Hit_AOIs.length === 0) return "red";
            // Use the Last AOI if multiple are hit to get the most specific one
            const firstAOI = d.Hit_AOIs.at(-1);
            return aoiColorScale(firstAOI) || "gray";
        })
        .attr("fill-opacity", 0.15);

    drawLegend();
}

function drawLegend() {
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 180}, 20)`);

    aoiColorScale.domain().forEach((aoi, i) => {
        const g = legend.append("g")
            .attr("transform", `translate(0, ${i * 25})`);

        g.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", aoiColorScale(aoi));

        g.append("text")
            .attr("x", 24)
            .attr("y", 14)
            .text(aoi)
            .style("font-size", "14px");
    });

    // Add an entry for unknown AOIs
    const unknown = legend.append("g")
        .attr("transform", `translate(0, ${aoiColorScale.domain().length * 25})`);

    unknown.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", "red");

    unknown.append("text")
        .attr("x", 24)
        .attr("y", 14)
        .text("Unknown")
        .style("font-size", "14px");
}

// Load the data
d3.csv("AOI_hit/WPI3_1b737573704s770_AOI_Hit.csv", d => {
    return {
        timestamp: +d.timestamp,
        x: +d.x,
        y: +d.y,
        Trackloss: d.Trackloss?.trim().toLowerCase(),
        Hit_AOIs: d.Hit_AOIs ? d.Hit_AOIs.split(",").map(a => a.trim()) : [],
        Problem_id: d.Problem_id, 
    };
}).then(data => {
    // filter out the problems where the HOO is on the left side. 
    const filtered = data.filter(d => d.Trackloss !== "missing" && d.Problem_id.includes("_R"));
    console.log("Filtered data:", filtered);
    drawHeatmap(filtered);
});

// d3 contours
// density estimation
// d3.contourDensisity