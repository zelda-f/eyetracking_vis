// define svg
const width = 800;
const height = 600;
const svg = d3.select("#dashboard")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const fs = require('fs');
const path = require('path');
// go to the AOI hit directory
const dataDir = path.join(__dirname, '..', 'AOI_hit');

fs.readdir(dataDir, (err, files) => {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }

    // Load each CSV file
    csvFiles.forEach(file => {
        const filePath = path.join(dataDir, file);
        loadData(filePath);
    });
})

// add drop down menus
const HOO_list = ["Right", "Left"]
const C_list = ["IC", "NC", "CC"]
const S_list = ["IS", "NS", "CS"]

// Load the data
function loadData(file) {
    d3.csv(file, d => {
        // Create a dropdown menu for the HOO
        d3.select("#HOO-dropdown")
            .selectAll("option")
            .data(HOO_list)
            .enter()
            .append("option")
            .text(d => d)
            .attr("value", d => d);
    
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
}

const HOO_dropdown = d3.select("#HOO-dropdown")


