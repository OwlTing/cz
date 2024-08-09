#!/usr/bin/env node
import { run } from '../dist/index.mjs'
run(['cz', ...process.argv.slice(2)])
