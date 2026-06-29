// server/services/projectAnalyzer.service.js
// Scores the Projects section of a resume.
// Rewards engineering depth, deployment proof, full-stack breadth, and real-world relevance.
// Penalizes generic tutorial projects and shallow descriptions.

'use strict';

// ─── Signal Definitions ───────────────────────────────────────────────────────

// Stack layer signals — reward projects that span multiple layers
const STACK_LAYERS = {
  frontend:    /\b(react|vue|angular|svelte|next\.?js|nuxt|html|css|tailwind|bootstrap|typescript|javascript|flutter|react native)\b/i,
  backend:     /\b(node\.?js|express|fastapi|django|flask|spring|rails|laravel|nestjs|hono|bun|deno|go|golang|rust|java|c#|\.net|asp\.net)\b/i,
  database:    /\b(mongodb|postgresql|mysql|sqlite|redis|cassandra|dynamodb|firestore|supabase|prisma|sequelize|mongoose|drizzle)\b/i,
  auth:        /\b(jwt|oauth|auth0|passport|authentication|authorization|rbac|session|cookie|firebase auth|clerk|nextauth)\b/i,
  deployment:  /\b(docker|kubernetes|k8s|aws|gcp|azure|vercel|netlify|railway|heroku|render|digitalocean|ec2|lambda|cloudflare|nginx)\b/i,
  cicd:        /\b(github actions|jenkins|circleci|travis|gitlab ci|ci\/cd|pipeline|workflow|automated deploy)\b/i,
  testing:     /\b(jest|mocha|chai|vitest|pytest|junit|cypress|playwright|selenium|unit test|integration test)\b/i,
  realtime:    /\b(websocket|socket\.io|server-sent|sse|mqtt|kafka|rabbitmq|pub.?sub|event.driven|streaming)\b/i,
  ai:          /\b(openai|gpt|langchain|llm|machine learning|ml|tensorflow|pytorch|huggingface|embedding|vector|rag|nlp)\b/i,
  security:    /\b(ssl|tls|https|cors|csrf|xss|sql injection|rate limit|helmet|encryption|hashing|bcrypt)\b/i,
};

// Generic / tutorial project indicators (penalty)
const GENERIC_PROJECTS = [
  /\b(todo\s*(app|list)?|to.?do\s*(app|list)?)\b/i,
  /\b(weather\s*app|calculator|clock\s*app|stopwatch|timer\s*app)\b/i,
  /\b(hello\s*world|basic\s*(CRUD|crud)|simple\s*(app|web|page))\b/i,
  /\b(tutorial|beginner|starter|sample project|demo app|practice project)\b/i,
];

// Depth signals — indicate non-trivial engineering
const DEPTH_SIGNALS = [
  /\b(api|rest|graphql|grpc|microservice|distributed|scalable|concurrent|async|multi.?threaded)\b/i,
  /\b(caching|cache|cdn|load balance|rate limit|pagination|search|filter|sort)\b/i,
  /\b(webhook|cron|background job|queue|worker|scheduler)\b/i,
  /\b(analytics|dashboard|monitoring|logging|tracing|metrics|telemetry)\b/i,
  /\b(payment|stripe|razorpay|e-commerce|checkout|subscription)\b/i,
  /\b(open.?source|npm package|library|sdk|cli tool|developer tool)\b/i,
];

// Scale / impact signals
const SCALE_SIGNALS = /\b(\d+[\s,]*(users?|requests?\/s|rps|concurrent|transactions|records?|visits?|downloads?))\b/i;

// Live deployment proof
const LIVE_SIGNALS = /\b(deployed\s*(on|to|at|using)|live\s*(at|on)|hosted\s*(on|at)|production|vercel|netlify|aws|gcp|railway|render|heroku)\b/i;

// ─── Main Analyzer ────────────────────────────────────────────────────────────

/**
 * @typedef {Object} ProjectAnalysis
 * @property {number}   score      - 0–100
 * @property {string[]} strengths
 * @property {string[]} weaknesses
 */

/**
 * Analyze the projects section of a resume.
 *
 * @param {{ projects: string[], [key: string]: string[] }} sections
 * @returns {ProjectAnalysis}
 */
function analyzeProjects(sections) {
  const projLines = (sections.projects || []).filter(l => l.trim().length > 0);

  if (projLines.length === 0) {
    return {
      score: 0,
      strengths: [],
      weaknesses: ['No projects section detected. Adding 2–3 well-described projects significantly boosts ATS scores for software roles.'],
    };
  }

  const fullText  = projLines.join(' ');
  const strengths  = [];
  const weaknesses = [];
  let rawScore = 0;

  // ── 1. Stack Breadth Score (0–30) ─────────────────────────────────────────
  // Count how many layers of the stack are present
  const presentLayers = Object.entries(STACK_LAYERS)
    .filter(([, rx]) => rx.test(fullText))
    .map(([name]) => name);

  const layerScore = Math.min(30, presentLayers.length * 5);
  rawScore += layerScore;

  if (presentLayers.length >= 5) {
    strengths.push(`Full-stack project coverage: ${presentLayers.join(', ')}.`);
  } else if (presentLayers.length >= 3) {
    strengths.push(`Projects cover ${presentLayers.length} stack layers: ${presentLayers.join(', ')}.`);
  } else {
    weaknesses.push(`Projects cover only ${presentLayers.length} technical layer(s). Add frontend, backend, database, and deployment details.`);
  }

  // ── 2. Engineering Depth Score (0–25) ─────────────────────────────────────
  const depthCount = DEPTH_SIGNALS.filter(rx => rx.test(fullText)).length;
  const depthScore = Math.min(25, depthCount * 5);
  rawScore += depthScore;

  if (depthCount >= 3) strengths.push('Projects demonstrate engineering depth (APIs, caching, async, queues, etc.).');
  else if (depthCount >= 1) strengths.push('Some engineering depth signals present in projects.');
  else weaknesses.push('Projects don\'t demonstrate engineering complexity. Mention APIs, caching, queues, pagination, or architecture decisions.');

  // ── 3. Deployment / Live Proof Score (0–20) ───────────────────────────────
  const hasLive = LIVE_SIGNALS.test(fullText);
  if (hasLive) {
    rawScore += 20;
    strengths.push('Projects include deployment or live hosting information.');
  } else {
    rawScore += 5; // partial credit for having projects at all
    weaknesses.push('No deployment or live URL mentioned. Add "Deployed on Vercel/AWS/Railway" or link a live demo.');
  }

  // ── 4. Scale / Impact Score (0–10) ────────────────────────────────────────
  if (SCALE_SIGNALS.test(fullText)) {
    rawScore += 10;
    strengths.push('Projects include scale or user impact data.');
  } else {
    weaknesses.push('No scale signals found (e.g. "500 users", "1000 req/s"). Quantify your project\'s reach or performance.');
  }

  // ── 5. Generic Project Penalty ────────────────────────────────────────────
  const genericCount = GENERIC_PROJECTS.filter(rx => rx.test(fullText)).length;
  const genericPenalty = genericCount * 8;
  rawScore = Math.max(0, rawScore - genericPenalty);

  if (genericCount > 0) {
    weaknesses.push(`${genericCount} generic/tutorial project(s) detected (Todo app, Weather app, etc.). Replace with original, problem-solving projects.`);
  }

  // ── 6. AI / Advanced Tech Bonus (0–5) ─────────────────────────────────────
  if (STACK_LAYERS.ai.test(fullText)) {
    rawScore = Math.min(100, rawScore + 5);
    strengths.push('AI/ML integration in projects — strong differentiator.');
  }

  return {
    score:     Math.min(100, Math.max(0, rawScore)),
    strengths: strengths.slice(0, 5),
    weaknesses: weaknesses.slice(0, 5),
  };
}

module.exports = { analyzeProjects };
