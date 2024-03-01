"use strict";

// D3 module

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const div = d3.selectAll("div");
// console.log(div);   TO CHECK IF IT WORKS

// IMPORTING DATA FROM JSON
const data = await d3.json("dataphase.json");
const phases = data.phase;
const relationships = data.relationships;
const phasesToTech = data.phaseToTech;

const dataTech = await d3.json("datatech.json");
const technology = dataTech.technology;
const techLinkReqFor = dataTech.techlinkReqFor;
const techLinkReqTo = dataTech.techlinkReqTo;
const techLinkBenFrom = dataTech.techlinkBenFrom;
const techLinkBenTo = dataTech.techlinkBenTo;
const firstTechsToPhase = dataTech.firstTechToPhase;
const secondTechsToPhase = dataTech.secondTechToPhase;

// CREATING TASK NODES AS OBJECTS
const phaseNodes = phases.map(({ id, name, requirements, functions }) => ({
  id,
  sourceLinks: [],
  targetLinks: [],
  name,
  requirements,
  functions,
}));

// console.log(task.Nodes.partOf);
// WHAT YOU DEFINE HERE GOES AS VALUE FOR LINK SOURCES AND TARGETS
const phaseById = new Map(phaseNodes.map((d) => [d.id, d]));
// console.log(phaseById.get("DOC"));

// CREATING LINKS AS OBJECTS

const links = relationships.map(({ source, target }) => ({
  source: phaseById.get(source),
  target: phaseById.get(target),
}));
// console.log(links);

const techNodes = technology.map(
  ({
    id,
    cluster,
    name,
    definition,
    general_requirements,
    functions,
    examples,
  }) => ({
    id,
    cluster,
    sourceLinks: [],
    targetLinks: [],
    name,
    definition,
    general_requirements,
    functions,
    examples,
  })
);
const techById = new Map(techNodes.map((d) => [d.id, d]));
// console.log(techById);

//TECHNOLOGY - LINKS REQUIREMENT FOR AS OBJECTS

const reqsFor = techLinkReqFor.map(({ source, target }) => ({
  source: techById.get(source),
  target: techById.get(target),
}));

//TECHNOLOGY - LINKS REQUIREMENT TO AS OBJECTS

const reqsTo = techLinkReqTo.map(({ source, target }) => ({
  source: techById.get(source),
  target: techById.get(target),
}));

//TECHNOLOGY - LINKS BENEFIT FROM AS OBJECTS

const bensFrom = techLinkBenFrom.map(({ source, target }) => ({
  source: techById.get(source),
  target: techById.get(target),
}));

//TECHNOLOGY - LINKS BENEFIT TO AS OBJECTS

const bensTo = techLinkBenTo.map(({ source, target }) => ({
  source: techById.get(source),
  target: techById.get(target),
}));

// CREATING OBJECTS FOR LINKING PHASE TO TECHNOLOGY
const phaseToTechLink = phasesToTech.map(({ source, target }) => ({
  sourcePhase: phaseById.get(source),
  targetTechnology: techById.get(target),
}));

// CREATING OBJECTS FOR 1. LINK TECHNOLOGY TO PHASE
const firstTechToPhaseLink = firstTechsToPhase.map(({ source, target }) => ({
  sourceTechnology: techById.get(source),
  targetPhase: phaseById.get(target),
}));
// console.log(firstTechToPhaseLink);

// CREATING OBJECTS FOR 2. LINK TECHNOLOGY TO PHASE
const secondTechToPhaseLink = secondTechsToPhase.map(({ source, target }) => ({
  sourceTechnology: techById.get(source),
  targetPhase: phaseById.get(target),
}));
// console.log(secondTechToPhaseLink);

const graphEl = function () {
  for (const link of links) {
    const { source, target } = link;
    source.sourceLinks.push(link);
    target.targetLinks.push(link);
  }
  return { phaseNodes, links };
};

const graph = graphEl();

const colorGr = d3.scaleOrdinal(
  graph.phaseNodes.map((d) => d.id).sort(d3.ascending),
  d3.schemeCategory10
);

const step = 35;

let margin = { top: 20, right: 20, bottom: 20, left: 400 };

const height = "250";
const width = (graph.phaseNodes.length - 1) * step + margin.left + margin.right;

const heightSVG = "100%";
const widthSVG = "100%";

d3.select("body")
  .append("svg")
  .attr("width", widthSVG)
  .attr("height", heightSVG);

// let x = d3.scalePoint(graph.nodes.map((d) => d.id).sort(d3.ascending),
let x = d3.scalePoint(
  graph.phaseNodes.map((d) => d.id),
  [margin.left, width - margin.right]
);

function arc(d) {
  const x1 = d.source.x;
  const x2 = d.target.x;
  const r = Math.abs(x1 - x2) / 2;
  // return `M${x1},${height / 2},A${r},${r} 0, 0, ${x1 < x2 ? 1 : 0} ${x2}, ${
  //   height / 2
  // }`;
  return `M${x1},${height - 30},A${r},${r} 0, 0, ${x1 < x2 ? 1 : 0} ${x2}, ${
    height - 30
  }`;
}

const svg = d3.select("svg");

// Create a D3 selection for the info-box
const infoBox = d3.select(".info-box");

// Create a function to display person attributes
function displayAttributesPhases(object) {
  infoBox.html(`
<strong>ID:</strong> ${object.id}<br>
<strong>Name:</strong> ${object.name}<br>
<strong>Requirements:</strong> ${object.requirements}<br>
<strong>Functions:</strong> ${object.functions}
`);
  // console.log(object);
}

function handleClickPhase(event, object) {
  // Toggle the visibility of the info box
  infoBox.style(
    "display",
    infoBox.style("display") === "none" ? "block" : "none"
  );
  // Display person attributes if the info box is visible
  if (infoBox.style("display") !== "none") {
    displayAttributesPhases(object);
  }
  // Prevent the click event from propagating to the body
  event.stopPropagation();
}

function hideInfoBox() {
  infoBox.style("display", "none");
}

// Create a function to handle click events on objects
// function handleClickPhase(event, object) {
//   displayAttributesPhases(object);
// }

const phaseLabel = svg
  .append("g")
  .attr("font-family", "Rubik")
  .attr("font-size", 15)
  .attr("text-anchor", "middle")
  .selectAll("g")
  .data(graph.phaseNodes)
  .join("g")
  // .attr("transform", (d) => `translate(${(d.x = x(d.id))}, ${height - 50})`)
  .attr("transform", (d) => `translate(${(d.x = x(d.id))}, ${height - 30})`)
  .on("click", (event, d) => handleClickPhase(event, d))
  .call((g) =>
    g
      .append("text")
      .attr("y", "30")
      .text((d) => d.id)
  )
  .call((g) => g.append("circle").attr("r", 6).attr("class", "phaseNode"));

// Create a D3 selection for the body
const body = d3.select("body");
body.on("click", hideInfoBox);

const path = svg
  .append("g")
  .attr("fill", "none")
  .attr("stroke-opacity", 0.6)
  .attr("stroke-width", 1.5)
  .selectAll("path")
  .data(graph.links)
  .join("path")
  .attr("stroke", "#ccc")
  .attr("d", arc);

svg.append("style").text(`

.primary{
  fill: none;
  stroke: black;
  font-weight: bold;
  font-size: 25px;
}

.secondary{
  stroke: #818589;
  fill: #818589;
}

.tertiary{
  fill: #F0F0F0;
  stroke: #F0F0F0;
}
`);

// OVERLAY FOR PHASES

const overlay = phaseLabel
  .data(graph.phaseNodes)
  .on("mouseover", function (event, d) {
    phaseLabel.classed("primary", function (n) {
      return n.id === d.id;
    });
    phaseLabel.classed("secondary", function (n) {
      return (
        n.sourceLinks.some((l) => l.target.id === d.id) ||
        n.targetLinks.some((l) => l.source.id === d.id)
      );
    });
    phaseLabel.classed("tertiary", function (n) {
      return n.id !== d.id && !d3.select(this).classed("secondary");
    });
    path.classed("primary", function (l) {
      return d.id === l.source.id || d.id === l.target.id;
    });
  })
  .on("mouseout", function (event, d) {
    phaseLabel.classed("primary", false);
    phaseLabel.classed("secondary", false);
    phaseLabel.classed("tertiary", false);
    path.classed("primary", false);
  });

// MAKING A GRAPH FOR TECHNOLOGIES

const graphEl1 = function () {
  for (const req of reqsFor) {
    const { source, target } = req;
    source.sourceLinks.push(req);
    target.targetLinks.push(req);
  }

  for (const reqTo of reqsTo) {
    const { source, target } = reqTo;
    source.sourceLinks.push(reqTo);
    target.targetLinks.push(reqTo);
  }

  for (const benFrom of bensFrom) {
    const { source, target } = benFrom;
    source.sourceLinks.push(benFrom);
    target.targetLinks.push(benFrom);
  }

  for (const benTo of bensTo) {
    const { source, target } = benTo;
    source.sourceLinks.push(benTo);
    target.targetLinks.push(benTo);
  }

  return { techNodes, reqsFor, reqsTo, bensFrom, bensTo };
};

const graph1 = graphEl1();

const colorGr1 = d3.scaleOrdinal(
  graph1.techNodes.map((d) => d.id).sort(d3.ascending),
  d3.schemeCategory10
);

const step1 = 50;

let margin1 = { top: 20, right: 20, bottom: 20, left: 300 };

const height1 = "450";
const width1 =
  (graph1.techNodes.length - 1) * step1 + margin1.left + margin1.right;

// d3.select("body").append("svg").attr("width", width1).attr("height", height1);

// let x = d3.scalePoint(graph.nodes.map((d) => d.id).sort(d3.ascending),
let x1 = d3.scalePoint(
  graph1.techNodes.map((d) => d.id),
  [margin1.left, width1 - margin1.right]
);

function arc1(d) {
  const x11 = d.source.x1;
  const x21 = d.target.x1;
  const r = Math.abs(x11 - x21) / 1.7;
  return `M${x11},${height1},A${r},${r} 0, 0, ${
    x11 < x21 ? 0 : 1
  } ${x21}, ${height1}`;
}

function arc2(d) {
  const x11 = d.source.x1;
  const x21 = d.target.x1;
  const r = Math.abs(x11 - x21) / 1.9;
  return `M${x11},${height1},A${r},${r} 0, 0, ${
    x11 < x21 ? 0 : 1
  } ${x21}, ${height1}`;
}

// EXAMPLE TO CLICK ON TECH AND SHOW ATTRIBUTE

// Create a D3 selection for the info-box
// const infoBox = d3.select(".info-box");

// Create a function to display person attributes
function displayAttributesTech(object) {
  infoBox.html(`
<strong>ID:</strong> ${object.id}<br>
<strong>Cluster:</strong> ${object.cluster}<br>
<strong>Name:</strong> ${object.name}<br>
<strong>Definition:</strong> ${object.definition}<br>
<strong>General requirements:</strong> ${object.general_requirements}<br>
<strong>Functions:</strong> ${object.functions}<br>
<strong>Examples:</strong> ${object.examples}
`);
  // console.log(object);
}

function handleClickTech(event, object) {
  // Toggle the visibility of the info box
  infoBox.style(
    "display",
    infoBox.style("display") === "none" ? "block" : "none"
  );
  // Display person attributes if the info box is visible
  if (infoBox.style("display") !== "none") {
    displayAttributesTech(object);
  }
  // Prevent the click event from propagating to the body
  event.stopPropagation();
}

// Create a function to handle click events on objects
// function handleClick(event, object) {
//   displayAttributes(object);
// }

const techLabel = svg
  .append("g")
  .attr("font-family", "Rubik")
  .attr("font-size", 15)
  .attr("text-anchor", "middle")
  .attr("class", "techLabel")
  .attr("id", "techLabel")
  .selectAll("g")
  .data(graph1.techNodes)
  .join("g")
  .attr("transform", (d) => `translate(${(d.x1 = x1(d.id))}, ${height1})`)
  // .on("click", handleClick)
  .on("click", (event, d) => handleClickTech(event, d))
  .call((g) =>
    g
      .append("text")
      .attr("y", "-15")
      .attr("class", "techText")
      .text((d) => d.id)
  )
  .call(
    (g) => g.append("circle").attr("r", 10).attr("class", "techNode")
    // .attr("fill", (d) => colorGr1(d.id))
  );

const requirementsFor = svg
  .append("g")
  .attr("fill", "none")
  .attr("stroke-opacity", 0.6)
  .attr("stroke-width", 1.5)
  .selectAll("path")
  .data(graph1.reqsFor)
  .join("path")
  .attr("stroke", "#ccc")
  .attr("d", arc1);

const requirementsTo = svg
  .append("g")
  .attr("fill", "none")
  .attr("stroke-opacity", 0.6)
  .attr("stroke-width", 1.5)
  .selectAll("path")
  .data(graph1.reqsTo)
  .join("path")
  .attr("stroke", "#ccc")
  .attr("d", arc2);

const benefitsFrom = svg
  .append("g")
  .attr("fill", "none")
  .attr("stroke-opacity", 0.6)
  .attr("stroke-width", 1.5)
  .selectAll("path")
  .data(graph1.bensFrom)
  .join("path")
  // .attr("stroke", "#bf40bf")
  .attr("stroke", "#ccc")
  .attr("d", arc1);

const benefitsTo = svg
  .append("g")
  .attr("fill", "none")
  .attr("stroke-opacity", 0.6)
  .attr("stroke-width", 1.5)
  .selectAll("path")
  .data(graph1.bensTo)
  .join("path")
  // .attr("stroke", "#bf40bf")
  .attr("stroke", "#ccc")
  .attr("d", arc2);

// OVERLAY FOR TECHNOLOGIES

svg.append("style").text(`

.primaryTech{
  fill: #1f305e;
  stroke: #1f305e;
  font-weight: bold;
  font-size: 25px;
}

.primaryReqFrom{
  fill: none;
  stroke: #c92a2a;
  font-weight: bold;
  stroke-opacity: 1;
  stroke-width: 3;
}

.primaryReqTo{
  fill: none;
  stroke: #0096FF;
  font-weight: bold;
  stroke-opacity: 1;
  stroke-width: 3;
}

.primaryBenFromTech{
  fill: none;
  stroke: #69db7c;
  font-weight: bold;
  stroke-opacity: 1;
  stroke-width: 3;
}

.primaryBenToTech{
  fill: none;
  stroke: #fcc419;
  font-weight: bold;
  stroke-opacity: 1;
  stroke-width: 3;
}

.secondary{
  stroke: #818589;
  fill: #818589;
}

.tertiary{
  fill: #F0F0F0;
  stroke: #F0F0F0;
}

.quaternary{
  fill: #f1f3f5;
  stroke: #f1f3f5;
}

`);

// OVERLAY TECHNOLOGIES

const overlayTechs = techLabel
  .data(graph1.techNodes)
  .on("mouseover", function (event, d) {
    techLabel.classed("primaryTech", function (n) {
      return n.id === d.id;
    });
    techLabel.classed("secondary", function (n) {
      return (
        n.sourceLinks.some((l) => l.target.id === d.id) ||
        n.targetLinks.some((l) => l.source.id === d.id)
      );
    });
    techLabel.classed("tertiary", function (n) {
      return n.id !== d.id && !d3.select(this).classed("secondary");
    });
    requirementsFor.classed("primaryReqFrom", function (l) {
      // return d.id === l.source.id;
      return d.id === l.target.id;
      // ||
    });
    requirementsTo.classed("primaryReqTo", function (l) {
      return d.id === l.source.id;
      // return d.id === l.target.id;
      // ||
    });
    // requirementsTo.classed("primaryReqTo", function (l) {
    //   return d.id === l.source.id || d.id === l.target.id;
    // });
    benefitsFrom.classed("primaryBenFromTech", function (l) {
      return d.id === l.target.id;
    });
    benefitsTo.classed("primaryBenToTech", function (l) {
      return d.id === l.source.id;
    });
  })
  .on("mouseout", function (event, d) {
    techLabel.classed("primaryTech", false);
    techLabel.classed("secondary", false);
    techLabel.classed("tertiary", false);
    requirementsFor.classed("primaryReqFrom", false);
    requirementsTo.classed("primaryReqTo", false);
    benefitsFrom.classed("primaryBenFromTech", false);
    benefitsTo.classed("primaryBenToTech", false);
  });

// DIVIDER FOR FIELD OF RENOVATION PROCESS
const dividerHeight = height * 1.02;
const dividerLine = {
  x1: 0,
  y1: dividerHeight,
  x2: widthSVG,
  y2: dividerHeight,
};

svg
  .append("line")
  .attr("x1", dividerLine.x1)
  .attr("y1", dividerLine.y1)
  .attr("x2", dividerLine.x2)
  .attr("y2", dividerLine.y2)
  .attr("stroke", "#fae3a0")
  .attr("stroke-width", 2);

// DIVIDER FOR FIELD OF TECHNOLOGIES

const dividerHeight2 = height1 - 40;
const dividerLine2 = {
  x1: 0,
  y1: dividerHeight2,
  x2: widthSVG,
  y2: dividerHeight2,
};

svg
  .append("line")
  .attr("x1", dividerLine2.x1)
  .attr("y1", dividerLine2.y1)
  .attr("x2", dividerLine2.x2)
  .attr("y2", dividerLine2.y2)
  .attr("stroke", "#fae3a0")
  .attr("stroke-width", 2);

// LINK BETWEEN PHASE AND TECHNOLOGY - 1. Link type

for (const ptoT of phaseToTechLink) {
  const pToTStart = ptoT.sourcePhase;
  // console.log(pToTStart);
  const link1_x1 = pToTStart.x;
  const link1_y1 = height;

  const pToTEnd = ptoT.targetTechnology;
  // console.log(pToTEnd);
  const link1_x2 = pToTEnd.x1;
  const link1_y2 = height1;
  const linesPtoT = svg
    .append("line")
    .attr("fill", "none")
    // .attr("stroke-opacity", 0.6)
    // .attr("stroke", "#ccc")
    .attr("class", "funcLink")
    .style("stroke", "#96f2d7")
    .style("stroke-width", 2)
    .attr("x1", link1_x1)
    .attr("y1", link1_y1)
    .attr("x2", link1_x2)
    .attr("y2", link1_y2);
}

const lines1 = d3.selectAll(".funcLink");
lines1.style("display", "none");

// 2. LINK BETWEEN TECHNOLOGY AND PHASE - OPTIMIZATIONS

for (const t2ToP of secondTechToPhaseLink) {
  const t2ToPStart = t2ToP.sourceTechnology;
  const link1_x1 = t2ToPStart.x1;
  const link1_y1 = height1;

  const t2ToPEnd = t2ToP.targetPhase;
  const link1_x2 = t2ToPEnd.x;
  const link1_y2 = height;

  const linesTtoPSecond = svg
    .append("line")
    .style("fill", "none")
    // .attr("stroke-opacity", 0.6)
    // .attr("stroke", "#ccc")
    .style("stroke", "#1864ab")
    .style("stroke-width", 2)
    // .style("stroke-dasharray", "15")
    .attr("class", "techTwoLink")
    .attr("x1", link1_x1)
    .attr("y1", link1_y1)
    .attr("x2", link1_x2)
    .attr("y2", link1_y2);
}

// 3. LINK BETWEEN TECHNOLOGY AND PHASE - NEW TASKS

for (const t1ToP of firstTechToPhaseLink) {
  const t1ToPStart = t1ToP.sourceTechnology;
  const link1_x1 = t1ToPStart.x1;
  const link1_y1 = height1;

  const t1ToPEnd = t1ToP.targetPhase;
  const link1_x2 = t1ToPEnd.x;
  const link1_y2 = height;

  const linesTtoPFirst = svg
    .append("line")
    .style("stroke", "#f783ac")
    .style("stroke-width", 2)
    // .style("stroke-dasharray", "30")
    .attr("fill", "none")
    // .attr("stroke-opacity", 0.6)
    // .attr("stroke", "#ccc")
    .attr("class", "techOneLink")
    .attr("x1", link1_x1)
    .attr("y1", link1_y1)
    .attr("x2", link1_x2)
    .attr("y2", link1_y2);
}

const lines2 = d3.selectAll(".techTwoLink");
lines2.style("display", "none");

const lines3 = d3.selectAll(".techOneLink");
lines3.style("display", "none");

d3.select(window).on("keydown", function (event) {
  if (event.key === "1") {
    lines1.style("display", "block");
  } else if (event.key === "0") {
    lines1.style("display", "none");
  }
  if (event.key === "2") {
    lines2.style("display", "block");
  } else if (event.key === "0") {
    lines2.style("display", "none");
  }
  if (event.key === "3") {
    lines3.style("display", "block");
  } else if (event.key === "0") {
    lines3.style("display", "none");
  }
});

// console.log(path);
// console.log(requirementsFor);
// console.log(requirementsTo);
// console.log(benefitsFrom);
// console.log(benefitsTo);
// console.log(lines1);
// console.log(lines2);
// console.log(lines3);

// OVERLAY FOR LINES BETWEEN PHASES AND TECHS INDIVIDUALLY
