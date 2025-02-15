let data = [];
let commits = [];

const width = 1000;
const height = 600;
let xScale, yScale; // ✅ Make scales global
let brushSelection = null;

document.addEventListener('DOMContentLoaded', async () => {
  console.log("DOM fully loaded. Starting data load...");
  await loadData();
  processCommits(); // ✅ Process commits after loading data
  displayStats(); // ✅ Ensure this function is defined before calling
  createScatterplot(); // ✅ Ensure this function is defined before calling
});

async function loadData() {
  data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line), 
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
    commit: row.commit
  }));

  console.log("CSV file loaded successfully:", data);
}

function processCommits() {
    console.log("Processing commits...");
  
    commits = d3.groups(data, (d) => d.commit).map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;
      let totalLines = lines.length || 0;
  
      console.log("📌 Checking commit data:", first); // Debugging
  
      return {
        id: commit,
        url: 'https://github.com/kyradeng/portfolio/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: totalLines,
        lines: lines.map(l => ({ type: l.type, line: l.line })) // ✅ Ensure `type` is included
      };
    });
  
    console.log("Processed commits:", commits);
  }

function displayStats() {
    console.log("Displaying summary stats...");
  
    const statsDiv = d3.select("#stats");
    statsDiv.html(""); // Clear previous content
  
    // ✅ Create Summary Container
    const summary = statsDiv.append("div").attr("class", "summary-container");
  
    // ✅ Get calculated statistics
    const totalCommits = commits.length;
    const totalFiles = d3.groups(data, (d) => d.file).length;
    const totalLOC = d3.sum(data, (d) => d.line);
    const maxDepth = d3.max(data, (d) => d.depth);
    const longestLine = d3.max(data, (d) => d.length);
    const maxLines = d3.max(commits, (d) => d.totalLines);
  
    // ✅ Define Summary Stats
    const summaryStats = [
      { label: "Commits", value: totalCommits, id: "total-commits" },
      { label: "Files", value: totalFiles, id: "total-files" },
      { label: "Total LOC", value: totalLOC, id: "total-loc" },
      { label: "Max Depth", value: maxDepth, id: "max-depth" },
      { label: "Longest Line", value: longestLine, id: "longest-line" },
      { label: "Max Lines", value: maxLines, id: "max-lines" },
    ];
  
    // ✅ Append Summary Boxes Dynamically
    summaryStats.forEach((stat) => {
      const box = summary.append("dl").attr("class", "summary-box");
      box.append("dt").text(stat.label);
      box.append("dd").attr("id", stat.id).text(stat.value);
    });
  }

// ✅ Define `createScatterplot()` before calling it
function createScatterplot() {
    const margin = { top: 10, right: 10, bottom: 30, left: 20 };
    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
      };

  if (commits.length === 0) {
    console.warn("No commit data available for scatterplot.");
    return;
  }

  const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

    xScale = d3.scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([usableArea.left, usableArea.right]) // ✅ Use usable area
    .nice();
  
  yScale = d3.scaleLinear()
    .domain([0, 24])
    .range([usableArea.bottom, usableArea.top]);

    const brush = d3.brush()
  .extent([[0, 0], [width, height]])
  .on("brush end", brushed);

svg.append("g")
  .attr("class", "brush")
  .call(brush);

// ✅ Ensure tooltips work after brushing

  const dots = svg.append('g').attr('class', 'dots');
  dots.selectAll('circle').data(sortedCommits).join('circle');

  dots
  .selectAll("circle")
  .data(commits)
  .join("circle")
  .attr("cx", (d) => xScale(d.datetime))
  .attr("cy", (d) => yScale(d.hourFrac))
  .attr("r", (d) => rScale(d.totalLines))
  .style("fill-opacity", 0.7)
  .attr("fill", "steelblue")
  .on("mouseenter", function (event, commit) {
    console.log("🔵 Hovered over dot:", commit); // Debugging log
    if (!commit || !commit.id) {
      console.warn("⚠️ Commit data is missing!", commit);
      return;
    }

    d3.select(this).style("fill-opacity", 1);
    updateTooltipContent(commit);
    updateTooltipVisibility(true);
    updateTooltipPosition(event);
  })
  .on("mousemove", function (event) {
    updateTooltipPosition(event);
  })
  .on("mouseleave", function () {
    console.log("🟠 Mouse left dot");
    d3.select(this).style("fill-opacity", 0.7);
    updateTooltipContent({});
    updateTooltipVisibility(false);
  });
      
      // Update scales with new ranges
      xScale.range([usableArea.left, usableArea.right]);
      yScale.range([usableArea.bottom, usableArea.top]);

      // Create the axes
const xAxis = d3.axisBottom(xScale);
const yAxis = d3
  .axisLeft(yScale)
  .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

// Add X axis
svg
  .append('g')
  .attr('transform', `translate(0, ${usableArea.bottom})`)
  .call(xAxis);

// Add Y axis
svg
  .append('g')
  .attr('transform', `translate(${usableArea.left}, 0)`)
  .call(yAxis);

  const gridlines = svg
  .append('g')
  .attr('class', 'gridlines')
  .attr('transform', `translate(${usableArea.left}, 0)`);

  

// Create gridlines as an axis with no labels and full-width ticks
gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));
d3.select("#chart").select("svg").selectAll(".dots").raise();

  console.log("Scatterplot drawn successfully!");
}

function updateTooltipContent(commit) {
    console.log("🟢 Updating tooltip with commit:", commit); // Debugging log
  
    const tooltip = document.getElementById("commit-tooltip");
    const link = document.getElementById("commit-link");
    const date = document.getElementById("commit-date");
    const time = document.getElementById("commit-time");
    const author = document.getElementById("commit-author");
    const linesEdited = document.getElementById("commit-lines");
  
    if (!commit || !commit.id) {
      console.log("⚠️ No commit found, clearing tooltip.");
      link.textContent = "";
      link.href = "#";
      date.textContent = "";
      time.textContent = "";
      author.textContent = "";
      linesEdited.textContent = "";
      return;
    }
  
    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime?.toLocaleString("en", { dateStyle: "full" });
    time.textContent = commit.time || "Unknown"; // ✅ Ensure time is set
    author.textContent = commit.author || "Unknown"; // ✅ Ensure author is set
    linesEdited.textContent = commit.totalLines || "0"; // ✅ Ensure totalLines is set
  }

  function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById("commit-tooltip");
  
    console.log(`🟢 Tooltip visibility changed: ${isVisible}`); // Debugging log
  
    if (isVisible) {
      tooltip.style.visibility = "visible";
      tooltip.style.opacity = "1"; // ✅ Ensures it's fully visible
      tooltip.style.display = "block"; // ✅ Makes sure it's not hidden
    } else {
      tooltip.style.visibility = "hidden";
      tooltip.style.opacity = "0";
      tooltip.style.display = "none"; // ✅ Ensures it does not take space
    }
  }

  function updateTooltipPosition(event) {
    const tooltip = document.getElementById("commit-tooltip");
  
    console.log(`📍 Moving tooltip to (${event.clientX}, ${event.clientY})`); // Debugging log
  
    tooltip.style.left = `${event.clientX + 10}px`; // Offset to prevent overlap
    tooltip.style.top = `${event.clientY + 10}px`;
  }

  const [minLines, maxLines] = d3.extent(commits, d => d.totalLines) || [1, 100];

  const rScale = d3.scaleSqrt()
    .domain([minLines || 1, maxLines || 100]) 
    .range([2, 30]);
  
    function brushSelector() {
        const svg = document.querySelector('svg');
        d3.select(svg).call(d3.brush());
      }

      d3.select(svg).call(d3.brush());

// Raise dots and everything after overlay
d3.select(svg).selectAll('.dots, .overlay ~ *').raise();

function isCommitSelected(commit) {
    if (!brushSelection) {
      return false;
    }
  
    const [[x0, y0], [x1, y1]] = brushSelection; // Extract selection bounds
  
    // Convert screen space back to data space
    const minDate = xScale.invert(x0);
    const maxDate = xScale.invert(x1);
    const minHour = yScale.invert(y1);
    const maxHour = yScale.invert(y0);
  
    // Get commit's data position
    const commitX = commit.datetime;
    const commitY = commit.hourFrac;
  
    // Check if commit falls inside selection bounds
    return commitX >= minDate && commitX <= maxDate && commitY >= minHour && commitY <= maxHour;
  }

  function brushed(event) {
    brushSelection = event.selection; // ✅ Store brush selection
    updateSelection();
    updateSelectionCount();
    updateLanguageBreakdown();
  }

  function updateSelection() {
    d3.selectAll("circle")
      .classed("selected", (d) => isCommitSelected(d));
  }
  d3.select(svg).call(d3.brush().on('start brush end', brushed));

  function updateSelectionCount() {
    const selectedCommits = brushSelection
      ? commits.filter(isCommitSelected)
      : [];
  
    const countElement = document.getElementById("selection-count");
    countElement.textContent = `${
      selectedCommits.length || "No"
    } commits selected`;
  
    return selectedCommits;
  }

  function updateLanguageBreakdown() {
    console.log("🟢 Updating Language Breakdown...");
  
    const selectedCommits = brushSelection
      ? commits.filter(isCommitSelected)
      : [];
  
    const container = document.getElementById("language-breakdown");
  
    if (selectedCommits.length === 0) {
      console.warn("⚠️ No commits selected. Clearing language breakdown.");
      container.innerHTML = "<p>No commits selected</p>";
      return;
    }
  
    const requiredCommits = selectedCommits.length ? selectedCommits : commits;
    
    // ✅ Extract lines and filter out undefined values
    const lines = requiredCommits.flatMap((d) => d.lines || []);
    const validLines = lines.filter(d => d && d.type); // ✅ Ensure `d.type` exists
  
    if (validLines.length === 0) {
      console.warn("⚠️ No valid lines with types found. Clearing breakdown.");
      container.innerHTML = "<p>No language data available</p>";
      return;
    }
  
    // ✅ Use d3.rollup to count lines per language
    const breakdown = d3.rollup(
      validLines, 
      (v) => v.length, 
      (d) => d.type
    );
  
    // ✅ Clear container and append breakdown
    container.innerHTML = "<h3>Language Breakdown</h3>";
  
    for (const [language, count] of breakdown) {
      const proportion = count / validLines.length;
      const formatted = d3.format(".1~%")(proportion);
  
      container.innerHTML += `
        <div>
            <dt>${language}</dt>
            <dd>${count} lines</dd>
            <dd><span>(${formatted})</span></dd>
        </div>
    `;
    }
  }