const fs = require("fs");
const path = require("path");
const glob = require("glob");

const pattern = process.argv[2] || "perf-reports/search-bench-*.json";
const files = glob.sync(pattern);

if (files.length === 0) {
  console.error("❌ No matching benchmark files found.");
  process.exit(1);
}

files.forEach((file) => {
  const data = JSON.parse(fs.readFileSync(file, "utf-8"));
  console.log(`📊 SUMMARY FOR: ${path.basename(file)}`);
  console.log("Requests.total:", data.requests.total);
  console.log("Requests/sec (mean):", data.requests.mean);
  console.log("Throughput (bytes/sec avg):", data.throughput.mean || data.throughput.average);
  console.log("Latency avg (ms):", data.latency.average);
  console.log("Latency p50 (ms):", data.latency.p50);
  console.log("Latency p95 (ms):", data.latency.p95);
  console.log("Errors:", data.errors);
  console.log("Non2xx:", data.non2xx);
  console.log("---------------------------");
});
