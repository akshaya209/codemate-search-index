const autocannon = require("autocannon");
const fs = require("fs");
const path = require("path");

async function run() {
  const url = process.env.URL || "http://localhost:3000/api/search?q=database";
  const connections = Number(process.env.CONNS) || 50;
  const duration = Number(process.env.DUR) || 30; // increase duration for better sampling

  console.log(`🚀 Running Search API benchmark: ${url}`);
  const result = await autocannon({
    url,
    connections,
    duration,
    method: "GET",
  });

  const reportDir = path.join(__dirname, "..", "perf-reports");
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir);

  const filePath = path.join(reportDir, `search-bench-${Date.now()}.json`);
  fs.writeFileSync(filePath, JSON.stringify(result, null, 2));

  // ✅ safer output
  const latency = result.latency || {};
  const p50 = latency.p50 ?? latency.average ?? "N/A";
  const p95 = latency.p95 ?? latency.p99 ?? "N/A";
  const throughput = result.throughput.average ?? result.throughput.mean ?? "N/A";

  console.log("✅ Results saved:", filePath);
  console.log(`p50: ${p50} ms`);
  console.log(`p95: ${p95} ms`);
  console.log(`Throughput: ${throughput} bytes/sec`);
  console.log("Errors:", result.errors);
}

run().catch(console.error);
