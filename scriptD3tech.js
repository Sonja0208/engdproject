"use strict";

// D3 module

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const div = d3.selectAll("div");
// console.log(div);   TO CHECK IF IT WORKS

// IMPORTING DATA FROM JSON
const data = await d3.json("datatech.json");

// MAKING A GRAPH

const graphEl = function () {
  // UPLOADING ARRAY OF OBJECTS FOR PHASES, TASKS AND LINKS
  // console.log(phases);
  const technology = data.technology;
  const interlink = data.interlink;

  // CREATING TASK NODES AS OBJECTS
  const techNodes = technology.map(({ id, name }) => ({
    id,
    // sourceLinks: [],
    // targetLinks: [],
    name,
  }));
  return { techNodes };
};

const graph = graphEl();

const colorGr = d3.scaleOrdinal(
  graph.techNodes.map((d) => d.id).sort(d3.ascending),
  d3.schemeCategory10
);

const step = 50;

let margin1 = { top: 20, right: 20, bottom: 20, left: 100 };

const height1 = "650";
const width1 =
  (graph.techNodes.length - 1) * step + margin1.left + margin1.right;

d3.select("body").append("svg").attr("width", width1).attr("height", height1);

// let x = d3.scalePoint(graph.nodes.map((d) => d.id).sort(d3.ascending),
let x1 = d3.scalePoint(
  graph1.techNodes.map((d) => d.id),
  [margin1.left, width1 - margin1.right]
);

const svg1 = d3.select("svg");

const techLabel = svg1
  .append("g")
  .attr("font-family", "sans-serif")
  .attr("font-size", 15)
  .attr("text-anchor", "middle")
  .selectAll("g")
  .data(graph1.techNodes)
  .join("g")
  // .attr("transform", (d) => `translate(${(d.x = x(d.id))}, ${height - 50})`)
  .attr("transform", (d) => `translate(${(d.x1 = x1(d.id))}, ${height1 - 30})`)
  .call((g) =>
    g
      .append("text")
      .attr("y", "30")
      .attr("fill", (d) => d3.lab(colorGr(d.id)).darker(3))
      .text((d) => d.id)
  )
  .call((g) =>
    g
      .append("circle")
      .attr("r", 5)
      .attr("fill", (d) => colorGr(d.id))
  );
