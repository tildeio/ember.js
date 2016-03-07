/* use strict; */
const InitialRenderBenchmark = require('chrome-tracing').InitialRenderBenchmark;

const benchmark = new InitialRenderBenchmark({
  name: "app initial render",
  url: "http://localhost:4200/initial-render/?r=feed-glimmer",
  endMarker: "renderEnd",
  browser: {
    type: "canary"
  }
});
benchmark.run().then((result) => {
  const render = result.samples.initialRender;
  const scriptEval = result.samples.scriptEvalWall;
  const evalCPU = result.samples.scriptEvalCPU;
  const functionCall = result.samples.functionCallWall;
  const functionCPU = result.samples.functionCallCPU;
  console.log(
`\nScriptEval: { mean: ${mean(scriptEval)}, median: ${median(scriptEval)} }
ScriptEvalCPU: { mean: ${mean(evalCPU)}, median: ${median(evalCPU)} }
FunctionCall: { mean: ${mean(functionCall)}, median: ${median(functionCall)} }
FunctionCallCPU: { mean: ${mean(functionCPU)}, median: ${median(functionCPU)} }
Initial Render Mean: { mean: ${mean(render)}, median: ${median(render)} }`
  );
}).catch((err) => {
  console.error(err);
  process.exit(1);
});

const sum = (items) => items.reduce((a, b) => a + b);

const mean = (items) => (sum(items) / items.length) / 1000;

const median = (items) => {
  items.sort();
  const mid = Math.ceil(items.length / 2) - 1;
  return items[mid] / 1000;
};
