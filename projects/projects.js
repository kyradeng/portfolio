import { fetchJSON, renderProjectsPage } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjectsPage(projects, projectsContainer, 'h2');

let colors = d3.scaleOrdinal(d3.schemeTableau10);
let query = '';
let searchInput = document.querySelector('.searchBar');
let selectedIndex = -1;

searchInput.addEventListener('input', (event) => {
    let query = event.target.value.toLowerCase();

    // Filter projects based on the query
    let filteredProjects = projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query.toLowerCase());
      });

    // Render updated project list
    renderProjectsPage(filteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects)
});

function renderPieChart(projectsGiven) {
    let newRolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,
        (d) => d.year
    );

    let newData = newRolledData.map(([year, count]) => ({
        year,
        value: count
    }));

    let newSliceGenerator = d3.pie().value(d => d.value);
    let newArcData = newSliceGenerator(newData);
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(100);

    let svg = d3.select('svg');
    svg.selectAll('path').remove(); // Remove old paths before adding new ones

    newArcData.forEach((d, i) => {
        svg.append('path')
            .attr('d', arcGenerator(d))
            .attr('fill', colors(i))
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .on('click', () => {
                selectedIndex = selectedIndex === i ? -1 : i;
                updateSelection(newData, projectsGiven);
            });
    });

    let legend = d3.select(".legend");
    legend.selectAll("li").remove();

    newData.forEach((d, i) => {
        legend.append("li")
            .attr("style", `--color: ${d3.schemeTableau10[i % d3.schemeTableau10.length]}`)
            .html(`<span class="swatch"></span> ${d.year} <em>(${d.value})</em>`)
            .style("cursor", "pointer")
            .on("click", () => {
                selectedIndex = selectedIndex === i ? -1 : i;
                updateSelection(newData, projectsGiven);
            });
    });
}
  
  // Call this function on page load
  renderPieChart(projects);
  
  searchInput.addEventListener('change', (event) => {
    let filteredProjects = setQuery(event.target.value);
    // re-render legends and pie chart when event triggers
    renderProjects(filteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects);
  });

  function updateSelection(newData, projectsGiven) {
    if (selectedIndex === -1) {
        renderProjectsPage(projects, projectsContainer, 'h2'); // Reset to full list
    } else {
        let selectedYear = newData[selectedIndex].year;
        let query = searchInput.value.toLowerCase(); // Get current search query

        let filteredProjects = projectsGiven.filter(p => 
            String(p.year) === String(selectedYear) &&
            Object.values(p).join('\n').toLowerCase().includes(query)
        );

        renderProjectsPage(filteredProjects, projectsContainer, 'h2');
    }
}