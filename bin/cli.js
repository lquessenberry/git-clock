#!/usr/bin/env node

import { run } from '../src/index.js';

const args = process.argv.slice(2);

run(args).catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
