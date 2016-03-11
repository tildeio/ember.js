/* use strict; */

'use strict';
const InitialRenderBenchmark = require('chrome-tracing').InitialRenderBenchmark;

new InitialRenderBenchmark({
  name: "glimmer initial render",
  url: "http://localhost:4200/initial-render/?r=feed-glimmer",
  endMarker: "renderEnd",
  browser: {
    type: "canary"
  }
}).run().then((result) => {
  let render = result.samples.initialRender;
  let scriptEval = result.samples.scriptEvalWall;
  let evalCPU = result.samples.scriptEvalCPU;
  let functionCall = result.samples.functionCallWall;
  let functionCPU = result.samples.functionCallCPU;

  console.log(`
ScriptEval: { mean: ${mean(scriptEval)}, median: ${median(scriptEval)}, dist: ${dist(scriptEval)} }
ScriptEvalCPU: { mean: ${mean(evalCPU)}, median: ${median(evalCPU)}, dist: ${dist(evalCPU)} }
FunctionCall: { mean: ${mean(functionCall)}, median: ${median(functionCall)}, dist: ${dist(functionCall)} }
FunctionCallCPU: { mean: ${mean(functionCPU)}, median: ${median(functionCPU)}, dist: ${dist(functionCPU)} }
Initial Render Mean: { mean: ${mean(render)}, median: ${median(render)}, dist: ${dist(render)} }
`);

//   return new InitialRenderBenchmark({
//     name: "htmlbars initial render",
//     url: "http://localhost:4200/initial-render/?r=feed-htmlbars",
//     endMarker: "renderEnd",
//     browser: {
//       type: "canary"
//     }
//   }).run();
// }).then(result => {
//   let render = result.samples.initialRender;
//   let scriptEval = result.samples.scriptEvalWall;
//   let evalCPU = result.samples.scriptEvalCPU;
//   let functionCall = result.samples.functionCallWall;
//   let functionCPU = result.samples.functionCallCPU;

//   console.log(`
// ScriptEval: { mean: ${mean(scriptEval)}, median: ${median(scriptEval)}, dist: ${dist(scriptEval)} }
// ScriptEvalCPU: { mean: ${mean(evalCPU)}, median: ${median(evalCPU)}, dist: ${dist(evalCPU)} }
// FunctionCall: { mean: ${mean(functionCall)}, median: ${median(functionCall)}, dist: ${dist(functionCall)} }
// FunctionCallCPU: { mean: ${mean(functionCPU)}, median: ${median(functionCPU)}, dist: ${dist(functionCPU)} }
// Initial Render Mean: { mean: ${mean(render)}, median: ${median(render)}, dist: ${dist(render)} }
// `);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});

const sum = (items) => items.reduce((a, b) => a + b);

const mean = (items) => (sum(items) / items.length) / 1000;

const median = (items) => {
  items.sort();
  let  mid = Math.ceil(items.length / 2) - 1;
  return items[mid] / 1000;
};

const dist = (items) => {
  items.sort();
  return JSON.stringify(items);
}
