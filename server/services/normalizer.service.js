// server/services/normalizer.service.js
// Pure, dependency-free text normalization.
// All functions are synchronous and fully unit-testable.

'use strict';

// ─── Alias Table ─────────────────────────────────────────────────────────────
// Maps every known non-canonical form → its canonical form.
// All keys and values must be lowercase.
// Longer / more specific patterns must be listed BEFORE shorter ones
// so that multi-word aliases are caught first.

const ALIAS_TABLE = new Map([
  // JavaScript variants
  ['node.js', 'node.js'],
  ['nodejs', 'node.js'],
  ['node js', 'node.js'],
  ['node.js runtime', 'node.js'],
  ['node lts', 'node.js'],

  // React variants
  ['reactjs', 'react'],
  ['react.js', 'react'],
  ['react js', 'react'],

  // Next.js
  ['nextjs', 'next.js'],
  ['next js', 'next.js'],

  // Angular
  ['angularjs', 'angular'],
  ['angular.js', 'angular'],

  // Vue
  ['vuejs', 'vue'],
  ['vue.js', 'vue'],
  ['vue js', 'vue'],

  // Express
  ['expressjs', 'express'],
  ['express.js', 'express'],
  ['express js', 'express'],

  // NestJS
  ['nestjs', 'nestjs'],
  ['nest.js', 'nestjs'],
  ['nest js', 'nestjs'],

  // REST API variants
  ['restful apis', 'rest api'],
  ['restful api', 'rest api'],
  ['restful', 'rest api'],
  ['rest apis', 'rest api'],
  ['rest services', 'rest api'],
  ['restful services', 'rest api'],
  ['rest web services', 'rest api'],
  ['restful web services', 'rest api'],

  // GraphQL
  ['graph ql', 'graphql'],
  ['graphql api', 'graphql'],

  // MongoDB
  ['mongo db', 'mongodb'],
  ['mongo', 'mongodb'],

  // PostgreSQL
  ['postgre sql', 'postgresql'],
  ['postgres', 'postgresql'],
  ['pgsql', 'postgresql'],

  // MySQL
  ['my sql', 'mysql'],
  ['mariadb', 'mysql'],
  ['maria db', 'mysql'],

  // TypeScript
  ['type script', 'typescript'],

  // JavaScript canonical
  ['java script', 'javascript'],
  ['ecmascript', 'javascript'],
  ['es6', 'javascript'],
  ['es2015', 'javascript'],
  ['es2020', 'javascript'],
  ['es2022', 'javascript'],
  ['vanilla js', 'javascript'],
  ['vanillajs', 'javascript'],

  // Python
  ['python3', 'python'],
  ['python 3', 'python'],
  ['python2', 'python'],

  // Java
  ['core java', 'java'],
  ['java se', 'java'],
  ['java ee', 'java'],
  ['java 8', 'java'],
  ['java 11', 'java'],
  ['java 17', 'java'],
  ['java 21', 'java'],

  // C++ aliases
  ['cpp', 'c++'],
  ['c plus plus', 'c++'],
  ['cplusplus', 'c++'],

  // C#
  ['csharp', 'c#'],
  ['c sharp', 'c#'],

  // Go
  ['golang', 'go'],
  ['go lang', 'go'],

  // Kotlin
  ['kotlin programming', 'kotlin'],

  // PHP
  ['php7', 'php'],
  ['php8', 'php'],

  // Ruby on Rails
  ['ruby on rails', 'rails'],
  ['ror', 'rails'],

  // AWS
  ['amazon web services', 'aws'],
  ['amazon aws', 'aws'],

  // GCP
  ['google cloud', 'gcp'],
  ['google cloud platform', 'gcp'],

  // Azure
  ['microsoft azure', 'azure'],
  ['ms azure', 'azure'],

  // Docker
  ['docker compose', 'docker'],
  ['docker-compose', 'docker'],
  ['dockerfile', 'docker'],
  ['docker container', 'docker'],

  // Kubernetes
  ['k8s', 'kubernetes'],
  ['kubectl', 'kubernetes'],
  ['kube', 'kubernetes'],

  // CI/CD
  ['ci cd', 'ci/cd'],
  ['cicd', 'ci/cd'],
  ['continuous integration', 'ci/cd'],
  ['continuous deployment', 'ci/cd'],
  ['continuous delivery', 'ci/cd'],
  ['continuous integration continuous deployment', 'ci/cd'],

  // GitHub Actions
  ['gh actions', 'github actions'],
  ['github-actions', 'github actions'],
  ['github workflow', 'github actions'],

  // RBAC
  ['role based access control', 'rbac'],
  ['role-based access control', 'rbac'],
  ['roles and permissions', 'rbac'],
  ['role based auth', 'rbac'],
  ['role-based authorization', 'rbac'],

  // OOP
  ['object oriented programming', 'oop'],
  ['object-oriented programming', 'oop'],
  ['oops', 'oop'],
  ['object oriented', 'oop'],
  ['object-oriented', 'oop'],

  // JWT
  ['json web token', 'jwt'],
  ['json web tokens', 'jwt'],
  ['jwt token', 'jwt'],
  ['jwt authentication', 'jwt'],
  ['jwt auth', 'jwt'],

  // OAuth
  ['oauth2', 'oauth'],
  ['oauth 2', 'oauth'],
  ['oauth 2.0', 'oauth'],
  ['open auth', 'oauth'],

  // SSO / SAML
  ['single sign on', 'sso'],
  ['single-sign-on', 'sso'],

  // Spring Boot
  ['springboot', 'spring boot'],
  ['spring-boot', 'spring boot'],

  // Django REST Framework
  ['django rest framework', 'django'],
  ['drf', 'django'],

  // Redis
  ['redis cache', 'redis'],
  ['redis server', 'redis'],

  // Tailwind
  ['tailwindcss', 'tailwind'],
  ['tailwind css', 'tailwind'],

  // Sass/SCSS
  ['scss', 'sass'],
  ['sass/scss', 'sass'],

  // Socket.io
  ['socketio', 'socket.io'],
  ['socket io', 'socket.io'],

  // TypeORM
  ['type orm', 'typeorm'],
  ['type-orm', 'typeorm'],

  // Prisma
  ['prisma orm', 'prisma'],
  ['prisma client', 'prisma'],

  // Microservices
  ['micro services', 'microservices'],
  ['microservice', 'microservices'],
  ['microservice architecture', 'microservices'],
  ['microservices architecture', 'microservices'],

  // System design
  ['system architecture', 'system design'],
  ['distributed system design', 'system design'],

  // Distributed systems
  ['distributed computing', 'distributed systems'],
  ['distributed architecture', 'distributed systems'],
  ['distributed system', 'distributed systems'],

  // MVC
  ['model view controller', 'mvc'],
  ['model-view-controller', 'mvc'],
  ['mvc pattern', 'mvc'],
  ['mvc architecture', 'mvc'],

  // DSA
  ['data structures', 'dsa'],
  ['algorithms', 'dsa'],
  ['data structures and algorithms', 'dsa'],

  // Machine Learning
  ['supervised learning', 'machine learning'],
  ['unsupervised learning', 'machine learning'],

  // TensorFlow
  ['tf', 'tensorflow'],
  ['tensorflow keras', 'tensorflow'],

  // PyTorch
  ['py torch', 'pytorch'],
  ['torch', 'pytorch'],

  // Scikit-learn
  ['sklearn', 'scikit-learn'],
  ['scikit learn', 'scikit-learn'],

  // NLP
  ['natural language processing', 'nlp'],
  ['text processing', 'nlp'],

  // Terraform
  ['hashicorp terraform', 'terraform'],
  ['terraform iac', 'terraform'],

  // Kafka
  ['apache kafka', 'kafka'],
  ['event streaming', 'kafka'],

  // GraphQL/Apollo
  ['apollo graphql', 'apollo federation'],
  ['apollo gateway', 'apollo federation'],
  ['apollo server', 'apollo federation'],

  // gRPC
  ['grpc', 'grpc'],
  ['protocol buffers', 'grpc'],
  ['protobuf', 'grpc'],

  // Infrastructure as Code
  ['iac', 'infrastructure as code'],
  ['infrastructure-as-code', 'infrastructure as code'],

  // TDD / BDD
  ['test driven development', 'tdd'],
  ['test-driven development', 'tdd'],
  ['behavior driven development', 'bdd'],
  ['behaviour driven development', 'bdd'],

  // DDD
  ['domain driven design', 'ddd'],
  ['domain-driven design', 'ddd'],

  // CQRS
  ['command query responsibility segregation', 'cqrs'],

  // Flutter
  ['flutter framework', 'flutter'],
  ['flutter sdk', 'flutter'],

  // React Native
  ['react-native', 'react native'],
  ['rn', 'react native'],

  // SOLID
  ['solid principles', 'solid principles'],
  ['solid design principles', 'solid principles'],

  // Event-driven
  ['event-driven', 'event driven'],
  ['event driven architecture', 'event driven'],
  ['event-driven architecture', 'event driven'],
  ['eda', 'event driven'],

  // SSL/TLS
  ['ssl', 'ssl/tls'],
  ['tls', 'ssl/tls'],
  ['https encryption', 'ssl/tls'],

  // High availability
  ['fault tolerance', 'high availability'],
  ['disaster recovery', 'high availability'],

  // GitLab
  ['git lab', 'gitlab'],

  // GitHub
  ['git hub', 'github'],

  // Power BI
  ['powerbi', 'power bi'],
  ['microsoft power bi', 'power bi'],

  // Apache Spark
  ['pyspark', 'apache spark'],
  ['py spark', 'apache spark'],

  // NLP / LLM synonyms
  ['language models', 'nlp'],
  ['llm', 'nlp'],

  // RAG
  ['retrieval augmented generation', 'rag'],
  ['retrieval-augmented generation', 'rag'],

  // Elasticsearch / OpenSearch
  ['open search', 'elasticsearch'],
  ['opensearch', 'elasticsearch'],

  // Three.js
  ['threejs', 'three.js'],
  ['three js', 'three.js'],
  ['webgl', 'three.js'],

  // D3.js
  ['d3js', 'd3.js'],
  ['data driven documents', 'd3.js'],

  // Chart.js
  ['chartjs', 'chart.js'],
  ['chart js', 'chart.js'],

  // Gatsby
  ['gatsby.js', 'gatsby'],
  ['gatsbyjs', 'gatsby'],

  // Nuxt
  ['nuxt.js', 'nuxt'],
  ['nuxtjs', 'nuxt'],

  // Remix
  ['remix.js', 'remix'],
  ['remixjs', 'remix'],
  ['remix run', 'remix'],

  // Solid.js
  ['solidjs', 'solid.js'],
  ['solid js', 'solid.js'],

  // Astro
  ['astro.js', 'astro'],
  ['astro build', 'astro'],

  // DynamoDB
  ['dynamo db', 'dynamodb'],
  ['amazon dynamodb', 'dynamodb'],
  ['aws dynamodb', 'dynamodb'],

  // Cassandra
  ['apache cassandra', 'cassandra'],

  // SSR / SSG
  ['server side rendering', 'ssr'],
  ['server-side rendering', 'ssr'],
  ['static site generation', 'ssg'],
  ['static site generator', 'ssg'],

  // SPA
  ['single page application', 'spa'],
  ['single-page app', 'spa'],

  // PWA
  ['progressive web app', 'pwa'],
  ['progressive web application', 'pwa'],

  // Framer Motion
  ['framer-motion', 'framer motion'],

  // Redux Toolkit
  ['redux toolkit', 'redux'],
  ['rtk', 'redux'],
  ['react-redux', 'redux'],

  // Material UI
  ['mui', 'material ui'],
  ['material-ui', 'material ui'],
  ['google material', 'material ui'],

  // ASP.NET
  ['asp.net core', 'asp.net'],
  ['aspnet', 'asp.net'],
  ['aspnetcore', 'asp.net'],
  ['.net core', 'asp.net'],
  ['dotnet core', 'asp.net'],
  ['dotnet', 'asp.net'],
  ['.net', 'asp.net'],

  // Spring
  ['spring framework', 'spring'],
  ['spring mvc', 'spring'],

  // ORM generic
  ['object relational mapping', 'orm'],

  // ElasticSearch / ELK
  ['elk', 'elasticsearch'],
  ['elk stack', 'elasticsearch'],
  ['kibana', 'elasticsearch'],
  ['logstash', 'elasticsearch'],

  // Shell Scripting
  ['bash scripting', 'shell scripting'],
  ['shell script', 'shell scripting'],
  ['bash script', 'shell scripting'],

  // Linux distributions → linux
  ['ubuntu', 'linux'],
  ['centos', 'linux'],
  ['debian', 'linux'],
  ['fedora', 'linux'],
  ['rhel', 'linux'],
  ['red hat', 'linux'],
  ['amazon linux', 'linux'],
  ['unix', 'linux'],

  // Monorepo tools
  ['nrwl nx', 'nx'],
  ['nx workspace', 'nx'],
  ['turbo repo', 'turborepo'],
  ['turbo build', 'turborepo'],

  // Celery
  ['celery worker', 'celery'],
  ['celery task', 'celery'],

  // gRPC
  ['g-rpc', 'grpc'],
  ['proto buffers', 'grpc'],

  // SSO / SAML
  ['saml', 'sso'],
  ['saml2', 'sso'],

  // Firebase
  ['cloud firestore', 'firebase'],
  ['firestore', 'firebase'],
  ['google firebase', 'firebase'],
  ['firebase db', 'firebase'],
  ['firebase realtime database', 'firebase'],

  // BigQuery
  ['big query', 'bigquery'],
  ['google bigquery', 'bigquery'],

  // Redshift
  ['amazon redshift', 'redshift'],
  ['aws redshift', 'redshift'],

  // Snowflake
  ['snowflake data warehouse', 'snowflake'],

  // Computer vision
  ['computer vision', 'opencv'],
  ['open cv', 'opencv'],
  ['cv2', 'opencv'],

  // Vector DBs
  ['pinecone db', 'pinecone'],
  ['weaviate db', 'weaviate'],
  ['chromadb', 'chroma'],
  ['chroma db', 'chroma'],

  // Bcrypt → hashing
  ['bcrypt', 'hashing'],
  ['sha256', 'hashing'],
  ['sha-256', 'hashing'],
  ['argon2', 'hashing'],
  ['password hashing', 'hashing'],

  // OWASP
  ['owasp top 10', 'owasp'],

  // Big O
  ['time complexity', 'big o notation'],
  ['space complexity', 'big o notation'],
  ['algorithmic complexity', 'big o notation'],

  // Load balancing
  ['load balancer', 'load balancing'],
  ['horizontal scaling', 'load balancing'],

  // Caching
  ['in-memory cache', 'caching'],
  ['distributed cache', 'caching'],
  ['cache layer', 'caching'],

  // Rate Limiting
  ['rate limiter', 'rate limiting'],
  ['throttling', 'rate limiting'],
  ['api throttling', 'rate limiting'],

  // API Gateway
  ['aws api gateway', 'api gateway'],
  ['amazon api gateway', 'api gateway'],

  // CloudFront
  ['aws cloudfront', 'cloudfront'],
  ['amazon cloudfront', 'cloudfront'],
  ['cdn cloudfront', 'cloudfront'],

  // RDS
  ['amazon rds', 'rds'],
  ['aws rds', 'rds'],

  // SQS
  ['amazon sqs', 'sqs'],
  ['aws sqs', 'sqs'],

  // Lambda
  ['aws lambda', 'lambda'],
  ['amazon lambda', 'lambda'],

  // EC2
  ['amazon ec2', 'ec2'],
  ['aws ec2', 'ec2'],

  // S3
  ['amazon s3', 's3'],
  ['aws s3', 's3'],
  ['s3 bucket', 's3'],

  // ECS
  ['amazon ecs', 'ecs'],
  ['aws ecs', 'ecs'],

  // EKS
  ['amazon eks', 'eks'],
  ['aws eks', 'eks'],
]);

// ─── Generic / Boilerplate words that should NEVER be treated as skills ────────
const GENERIC_BLOCKLIST = new Set([
  'world', 'right', 'career', 'place', 'line', 'action', 'state', 'good',
  'best', 'great', 'technology', 'company', 'team', 'work', 'employee',
  'job', 'role', 'working', 'worked', 'will', 'shall', 'must', 'should',
  'would', 'could', 'help', 'fast', 'quickly', 'quick', 'complex', 'simple',
  'smart', 'effort', 'tier', 'level', 'ability', 'able', 'looking', 'seek',
  'seeking', 'teams', 'companies', 'organization', 'environment', 'opportunity',
  'responsible', 'responsibilities', 'duty', 'duties', 'including', 'related',
  'years', 'year', 'plus', 'using', 'use', 'used', 'new', 'also', 'well',
  'across', 'within', 'various', 'implement', 'plan', 'meet', 'test', 'call',
  'drive', 'manage', 'managing', 'support', 'supporting', 'ensure', 'provide',
  'lead', 'leading', 'own', 'owning', 'someone', 'anyone', 'everyone',
  'something', 'anything', 'who', 'whom', 'whose', 'current', 'experience',
  'strong', 'excellent', 'knowledge', 'understanding', 'familiar', 'skills',
  'skill', 'background', 'degree', 'bachelor', 'master', 'university',
  'college', 'graduate', 'student', 'intern', 'senior', 'junior', 'mid',
  'entry', 'candidate', 'applicant', 'position', 'minimum', 'required',
  'preferred', 'plus', 'bonus', 'nice', 'have', 'looking', 'hire', 'join',
  'build', 'building', 'built', 'develop', 'developing', 'developed',
  'create', 'creating', 'created', 'make', 'making', 'made', 'write',
  'writing', 'written', 'read', 'reading', 'understand', 'learning',
  'learned', 'learn', 'grow', 'growing', 'grown', 'improve', 'improving',
  'improved', 'increase', 'increasing', 'increased', 'reduce', 'reducing',
  'reduced', 'maintain', 'maintaining', 'maintained', 'review', 'reviewing',
  'reviewed', 'collaborate', 'collaborating', 'collaborated', 'communicate',
  'communicating', 'problem', 'solving', 'solution', 'solutions', 'approach',
  'approach', 'idea', 'ideas', 'concept', 'concepts', 'method', 'methods',
  'process', 'processes', 'tool', 'tools', 'using', 'utilizing', 'utilize',
  'leverage', 'leveraging', 'leveraged', 'implement', 'implementing',
  'implemented', 'deploy', 'deploying', 'deployed', 'ship', 'shipping',
  'shipped', 'release', 'releasing', 'released', 'launch', 'launching',
  'launched', 'deliver', 'delivering', 'delivered', 'complete', 'completing',
  'completed', 'finish', 'finishing', 'finished', 'start', 'starting',
  'started', 'begin', 'beginning', 'began', 'continue', 'continuing',
  'continued', 'repeat', 'repeating', 'repeated', 'update', 'updating',
  'updated', 'upgrade', 'upgrading', 'upgraded', 'migrate', 'migrating',
  'migrated', 'refactor', 'refactoring', 'refactored', 'optimize',
  'optimizing', 'optimized', 'scale', 'scaling', 'scaled', 'monitor',
  'monitoring', 'monitored', 'debug', 'debugging', 'debugged', 'fix',
  'fixing', 'fixed', 'resolve', 'resolving', 'resolved', 'handle',
  'handling', 'handled', 'manage', 'managing', 'managed', 'track',
  'tracking', 'tracked', 'analyze', 'analyzing', 'analyzed', 'evaluate',
  'evaluating', 'evaluated', 'assess', 'assessing', 'assessed', 'identify',
  'identifying', 'identified', 'define', 'defining', 'defined', 'design',
  'designing', 'designed', 'architect', 'architecting', 'architected',
  'integrate', 'integrating', 'integrated', 'connect', 'connecting',
  'connected', 'configure', 'configuring', 'configured', 'setup', 'setting',
  'set', 'run', 'running', 'ran', 'execute', 'executing', 'executed',
  'automate', 'automating', 'automated', 'schedule', 'scheduling',
  'scheduled', 'trigger', 'triggering', 'triggered', 'event', 'events',
  'data', 'information', 'content', 'report', 'reports', 'dashboard',
  'dashboards', 'metric', 'metrics', 'log', 'logs', 'alert', 'alerts',
  'notification', 'notifications', 'message', 'messages', 'request',
  'requests', 'response', 'responses', 'error', 'errors', 'exception',
  'exceptions', 'failure', 'failures', 'success', 'successful',
  'performance', 'reliability', 'availability', 'stability', 'quality',
  'efficiency', 'productivity', 'velocity', 'throughput', 'latency',
  'bandwidth', 'capacity', 'volume', 'scale', 'size', 'large', 'small',
  'high', 'low', 'fast', 'slow', 'real', 'time', 'live', 'online',
  'offline', 'remote', 'local', 'global', 'national', 'international',
  'public', 'private', 'internal', 'external', 'client', 'server',
  'frontend', 'backend', 'fullstack', 'full', 'stack', 'web', 'mobile',
  'desktop', 'cloud', 'platform', 'service', 'services', 'system',
  'systems', 'network', 'networks', 'infrastructure', 'architecture',
  'framework', 'library', 'libraries', 'module', 'modules', 'component',
  'components', 'feature', 'features', 'function', 'functions', 'method',
  'class', 'classes', 'object', 'objects', 'type', 'types', 'interface',
  'interfaces', 'model', 'models', 'schema', 'schemas', 'query', 'queries',
  'mutation', 'mutations', 'field', 'fields', 'value', 'values', 'key',
  'keys', 'index', 'indexes', 'table', 'tables', 'row', 'rows', 'column',
  'columns', 'record', 'records', 'document', 'documents', 'collection',
  'collections', 'bucket', 'item', 'items', 'list', 'array', 'map',
  'set', 'queue', 'stack', 'tree', 'graph', 'node', 'edge', 'vertex',
  'path', 'route', 'routes', 'endpoint', 'endpoints', 'url', 'uri',
  'link', 'links', 'page', 'pages', 'view', 'views', 'template',
  'templates', 'layout', 'layouts', 'style', 'styles', 'theme', 'themes',
  'color', 'colours', 'font', 'fonts', 'image', 'images', 'icon', 'icons',
  'button', 'buttons', 'form', 'forms', 'input', 'inputs', 'field',
  'label', 'labels', 'text', 'string', 'number', 'boolean', 'null',
  'undefined', 'true', 'false', 'yes', 'no', 'may', 'can', 'like',
  'make', 'take', 'give', 'get', 'put', 'post', 'delete', 'patch',
  'check', 'validate', 'verify', 'confirm', 'test', 'testing', 'tested',
]);

// ─── HTML tag regex ───────────────────────────────────────────────────────────
const HTML_TAG_RE = /<[^>]+>/g;

// ─── Functions ────────────────────────────────────────────────────────────────

/**
 * Strip HTML tags, collapse whitespace, and lowercase the entire string.
 * @param {string} text
 * @returns {string}
 */
function normalizeText(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(HTML_TAG_RE, ' ')         // strip HTML
    .replace(/\r\n|\r/g, '\n')         // normalize line endings
    .replace(/[ \t]+/g, ' ')           // collapse horizontal whitespace
    .replace(/\n{3,}/g, '\n\n')        // max 2 blank lines
    .trim();
}

/**
 * Apply the alias normalization table to a single lowercase token/phrase.
 * Returns the canonical form if found, otherwise returns the input unchanged.
 * @param {string} token - already lowercased
 * @returns {string}
 */
function applyAliasTable(token) {
  return ALIAS_TABLE.get(token) || token;
}

/**
 * Normalize a single skill token/phrase:
 *  1. lowercase
 *  2. collapse whitespace
 *  3. remove leading/trailing punctuation (but keep internal punctuation like # in c#)
 *  4. apply alias table
 * @param {string} token
 * @returns {string}
 */
function normalizeSkillToken(token) {
  if (!token || typeof token !== 'string') return '';
  const lower = token
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^[^a-z0-9]+|[^a-z0-9+#.]+$/g, ''); // strip leading/trailing non-alphanumeric (keep . # +)
  return applyAliasTable(lower);
}

/**
 * Returns true if the token is in the generic blocklist and should
 * never be treated as an ATS skill keyword.
 * @param {string} token - normalized (lowercase)
 * @returns {boolean}
 */
function isGenericWord(token) {
  return GENERIC_BLOCKLIST.has(token.toLowerCase());
}

/**
 * Generate all n-gram windows (n = 1..maxN) from a token array.
 * @param {string[]} tokens
 * @param {number} maxN
 * @returns {string[]}
 */
function extractNgrams(tokens, maxN = 3) {
  const ngrams = [];
  for (let n = 1; n <= maxN; n++) {
    for (let i = 0; i <= tokens.length - n; i++) {
      ngrams.push(tokens.slice(i, i + n).join(' '));
    }
  }
  return ngrams;
}

/**
 * Tokenize normalized text into individual lowercase word tokens,
 * stripping purely punctuation tokens.
 * @param {string} text
 * @returns {string[]}
 */
function tokenize(text) {
  return text
    .toLowerCase()
    .split(/[\s,;:|()\[\]{}<>'"]+/)
    .map(t => t.replace(/^[^a-z0-9]+|[^a-z0-9+#.]+$/g, ''))
    .filter(t => t.length > 0);
}

module.exports = {
  normalizeText,
  normalizeSkillToken,
  applyAliasTable,
  isGenericWord,
  extractNgrams,
  tokenize,
  ALIAS_TABLE,
  GENERIC_BLOCKLIST,
};
