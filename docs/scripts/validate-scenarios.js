#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const Ajv = require('ajv/dist/2020');
const addFormats = require('ajv-formats');

function stripJsonLineComments(src){
  return src
    .split('\n')
    .filter(line => !line.trim().startsWith('//'))
    .join('\n');
}

const rootDir = path.resolve(__dirname, '..');
const schemaPath = path.join(rootDir, 'schema', 'scenario.v27.json');
const scenariosDir = path.join(rootDir, 'scenarios');

let schemaRaw;
try {
  schemaRaw = fs.readFileSync(schemaPath, 'utf8');
} catch (err) {
  console.error(`Failed to read schema at ${schemaPath}:`, err.message);
  process.exit(1);
}

let schema;
try {
  schema = JSON.parse(stripJsonLineComments(schemaRaw));
} catch (err) {
  console.error('Schema file is not valid JSON:', err.message);
  process.exit(1);
}

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);
const schemaVersion = schema?.properties?.meta?.properties?.version?.const;

let files;
try {
  files = fs.readdirSync(scenariosDir).filter(f => f.toLowerCase().endsWith('.json'));
} catch (err) {
  console.error(`Failed to read scenarios directory at ${scenariosDir}:`, err.message);
  process.exit(1);
}

if (!files.length) {
  console.warn('No scenario JSON files found to validate.');
  process.exit(0);
}

let hasErrors = false;
const skipped = [];

for (const file of files) {
  const filePath = path.join(scenariosDir, file);
  let data;
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    data = JSON.parse(raw);
  } catch (err) {
    console.error(`\n${file}: Failed to parse JSON - ${err.message}`);
    hasErrors = true;
    continue;
  }

  const version = data?.meta?.version;
  if (schemaVersion && version !== schemaVersion){
    const versionLabel = version == null ? 'missing' : String(version);
    console.warn(`\n${file}: Skipped (meta.version ${versionLabel} does not match schema version ${schemaVersion}).`);
    skipped.push(file);
    continue;
  }

  const valid = validate(data);
  if (!valid) {
    hasErrors = true;
    console.error(`\n${file}: Schema validation failed.`);
    for (const issue of validate.errors || []) {
      const pathInfo = issue.instancePath || '(root)';
      console.error(`  [${pathInfo}] ${issue.message}`);
    }
  }
}

if (hasErrors) {
  console.error('\nScenario validation failed.');
  process.exit(1);
}

if (skipped.length){
  console.warn(`Skipped ${skipped.length} file(s) due to version mismatch.`);
}

console.log('All scenario files are valid.');
