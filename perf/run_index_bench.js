const autocannon = require("autocannon");
const fs = require("fs");
const path = require("path");

async function run() {
  const url = process.env.URL || "http://localhost:3000/api/index/build";
  const connections = Number(process.env.CONNS) || 20;
  const duration = Number(process.env.DUR) || 10;

  console.log(`🚀 Running Index Build API benchmark: ${url}`);
  const result = await autocannon({
    url,
    method: "POST",
    connections,
    duration,
  });

  const reportDir = path.join(__dirname, "..", "perf-reports");
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir);

  const filePath = path.join(reportDir, `index-bench-${Date.now()}.json`);
  fs.writeFileSync(filePath, JSON.stringify(result, null, 2));

  console.log("✅ Results saved:", filePath);
  console.log("p50:", result.latency.p50, "ms");
  console.log("p95:", result.latency.p95, "ms");
  console.log("Throughput:", result.throughput.average, "bytes/sec");
  console.log("Errors:", result.errors);
}

run().catch(console.error);
