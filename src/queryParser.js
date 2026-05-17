// src/queryParser.js
const express = require("express");
const { invertedIndex } = require("./invertedIndex"); // ✅ removed unused 'queryIndex'
const router = express.Router();

/**
 * Tokenize query terms to match normalized text
 * Reuse same normalization logic (simple): lowercase + keep alphanum + spaces
 */
function normalizeToken(tok) {
  return String(tok || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^0-9a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Produce tokens for parsing: terms, phrases, operators, parentheses */
function lex(input) {
  const tokens = [];
  let i = 0;
  while (i < input.length) {
    const ch = input[i];

    if (/\s/.test(ch)) { i++; continue; }

    if (ch === '"') {
      // phrase
      i++;
      let phrase = "";
      while (i < input.length && input[i] !== '"') {
        phrase += input[i++];
      }
      i++; // skip closing "
      tokens.push({ type: "PHRASE", value: normalizeToken(phrase) });
      continue;
    }

    if (ch === "(") { tokens.push({ type: "LPAR" }); i++; continue; }
    if (ch === ")") { tokens.push({ type: "RPAR" }); i++; continue; }

    // word/operator
    let word = "";
    while (i < input.length && /[^()\s"]/.test(input[i])) {
      word += input[i++];
    }
    const up = word.toUpperCase();
    if (up === "AND" || up === "OR" || up === "NOT") {
      tokens.push({ type: "OP", value: up });
    } else {
      tokens.push({ type: "TERM", value: normalizeToken(word) });
    }
  }
  return tokens;
}

/** precedence */
const PREC = { OR: 1, AND: 2, NOT: 3 };

/** shunting-yard: convert token list to postfix */
function toPostfix(tokens) {
  const out = [];
  const ops = [];

  for (const tok of tokens) {
    if (tok.type === "TERM" || tok.type === "PHRASE") {
      out.push(tok);
    } else if (tok.type === "OP") {
      const o1 = tok.value;
      while (ops.length) {
        const top = ops[ops.length - 1];
        if (top.type !== "OP") break;
        const o2 = top.value;
        if ((PREC[o2] > PREC[o1]) || (PREC[o2] === PREC[o1] && o1 !== "NOT")) {
          out.push(ops.pop());
        } else break;
      }
      ops.push(tok);
    } else if (tok.type === "LPAR") {
      ops.push(tok);
    } else if (tok.type === "RPAR") {
      while (ops.length && ops[ops.length - 1].type !== "LPAR") out.push(ops.pop());
      if (ops.length && ops[ops.length - 1].type === "LPAR") ops.pop();
      else throw new Error("Mismatched parentheses");
    }
  }

  while (ops.length) {
    const p = ops.pop();
    if (p.type === "LPAR" || p.type === "RPAR") throw new Error("Mismatched parentheses");
    out.push(p);
  }
  return out;
}

/** helpers to convert term results to sets/maps and phrase evaluation */
function docsMapFromTermResult(list) {
  // input is array of { docId, positions } OR empty
  const map = new Map();
  for (const entry of list) {
    map.set(entry.docId, entry.positions.slice()); // clone positions
  }
  return map;
}

/** phrase check: returns doc map with positions for phrase matches */
function evaluatePhrase(phrase) {
  if (!phrase) return new Map();
  const words = phrase.split(/\s+/).filter(Boolean);
  if (words.length === 0) return new Map();

  // get positions list for first term
  const first = invertedIndex.index[words[0]] || [];
  const candidates = docsMapFromTermResult(first);

  // for each subsequent word, filter candidate doc positions by sequential positions
  for (let w = 1; w < words.length; w++) {
    const cur = invertedIndex.index[words[w]] || [];
    const curMap = docsMapFromTermResult(cur);

    for (const [docId, positions] of Array.from(candidates.entries())) {
      const nextPositions = [];
      const setCur = new Set(curMap.get(docId) || []);
      for (const p of positions) {
        if (setCur.has(p + 1)) nextPositions.push(p + 1); // store position of next word
      }
      if (nextPositions.length === 0) candidates.delete(docId);
      else candidates.set(docId, nextPositions);
    }
  }

  // Convert stored positions to positions representing the start of phrase
  const out = new Map();
  for (const [docId, lastPositions] of candidates.entries()) {
    const starts = lastPositions.map((p) => p - (words.length - 1)).filter((n) => n >= 0);
    if (starts.length) out.set(docId, starts);
  }
  return out;
}

/** Evaluate postfix expression */
function evalPostfix(postfix) {
  const stack = [];

  for (const tok of postfix) {
    if (tok.type === "TERM") {
      const entries = invertedIndex.index[tok.value] || [];
      stack.push(docsMapFromTermResult(entries));
    } else if (tok.type === "PHRASE") {
      stack.push(evaluatePhrase(tok.value));
    } else if (tok.type === "OP") {
      if (tok.value === "NOT") {
        const a = stack.pop() || new Map();
        const allDocIds = new Set();
        for (const term in invertedIndex.index) {
          (invertedIndex.index[term] || []).forEach((e) => allDocIds.add(e.docId));
        }
        const res = new Map();
        for (const d of allDocIds) {
          if (!a.has(d)) res.set(d, []);
        }
        stack.push(res);
      } else {
        const b = stack.pop() || new Map();
        const a = stack.pop() || new Map();
        if (tok.value === "AND") {
          const out = new Map();
          for (const [docId, positionsA] of a.entries()) {
            if (b.has(docId)) {
              const positions = positionsA.concat(b.get(docId) || []);
              out.set(docId, positions);
            }
          }
          stack.push(out);
        } else if (tok.value === "OR") {
          const out = new Map(a.entries());
          for (const [docId, positionsB] of b.entries()) {
            if (out.has(docId)) {
              out.set(docId, out.get(docId).concat(positionsB));
            } else out.set(docId, positionsB.slice());
          }
          stack.push(out);
        } else {
          throw new Error(`Unknown operator ${tok.value}`);
        }
      }
    } else {
      throw new Error("Unexpected token during evaluation");
    }
  }

  const result = stack.pop() || new Map();
  return result;
}

/** Convert Map result -> array of { docId, positions } */
function mapToArray(map) {
  const arr = [];
  for (const [docId, positions] of map.entries()) {
    arr.push({ docId, positions: positions || [] });
  }
  return arr;
}

/** Public route: GET /api/query?q=... */
router.get("/query", async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    if (!q) return res.status(400).json({ error: "Query parameter 'q' is required" });

    const tokens = lex(q);
    const postfix = toPostfix(tokens);
    const resultMap = evalPostfix(postfix);
    const results = mapToArray(resultMap);

    res.status(200).json({ query: q, count: results.length, results });
  } catch (err) {
    console.error("Query parse/eval error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
