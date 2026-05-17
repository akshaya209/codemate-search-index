// tools/bench_queries.js
// Usage: node tools/bench_queries.js --url http://localhost:3000 --term "database"
const autocannon = require("autocannon");
const argv = require("minimist")(process.argv.slice(2));
const fetch = require("node-fetch");

const base = argv.url || "http://localhost:3000";
const term = argv.term || "database";
const connections = Number(argv.connections || 10);
const duration = Number(argv.duration || 5); // seconds
const requestsPerSecond = argv.rps || 0;

async function buildIndex() {
  const res = await fetch(`${base}/api/index/build`, { method: "POST" });
  if (!res.ok) throw new Error(`Build failed: ${res.status}`);
  return res.json();
}

async function runAutocannon() {
  console.log("Running autocannon test...");
  return new Promise((resolve, reject) => {
    const url = `${base}/api/index/search?term=${encodeURIComponent(term)}`;
    const inst = autocannon({
      url,
      connections,
      duration,
      pipelining: 1,
      // if you want target rps: set 'overallRate' in latest autocannon versions
    }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });

    autocannon.track(inst, { renderProgressBar: true });
  });
}

(async () => {
  try {
    console.log("Building index...");
    const info = await buildIndex();
    console.log("Build info:", info);

    const result = await runAutocannon();
    console.log("Autocannon summary:");
    console.log({
      requests: result.requests.total,
      latencyAvg: result.latency.average,
      latencyP95: result.latency.p95,
      throughput: result.throughput.total,
      errors: result.errors,
    });
  } catch (err) {
    console.error("Bench error:", err);
    process.exit(1);
  }
})();
