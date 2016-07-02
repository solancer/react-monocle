#!/usr/bin/env node
'use strict'
const program = require('commander');
const glob = require('glob');
const astGenerator = require('../src/astGenerator');
const assign = require('lodash.assign');
const d3DataBuilder = require('../src/d3DataBuilder');
const renderHtml = require('../src/d3Tree/renderHtml');
const start = Date.now();

// specifying one required parameter
program
  .option('-e, --entry <entry>', 'App entry point. Defaults to JSX file where ReactDOM.render is found.')
  .option('-d, --directory <directory>', 'directory of React files. Defaults to where Monocle was called.')
  .option('-j, --extension <extension>', 'extension of React files (jsx or js). Defaults to .jsx (only use when specifying/in directory which has your React files!)')
  .parse(process.argv);


(function() {
  const entry = program.entry || null;
  const directory = program.directory || process.cwd();
  const ext = program.extension || 'jsx';
  // globs to match any jsx in directory called
  glob(`**/*.${ext}`, {cwd: directory, nosort:true, ignore: 'node_modules/**'}, (err, files) => {
    if (files.length === 0) throw new Error('No files found (try specifying file path and extension)')

    // converting file paths to abstract syntax trees (output is an array with {ComponentName: AST} objects)
    const astz = files.map(ele => {return astGenerator(ele)})
    let componentObject = assign.apply(null, astz); // combining into one file
    if (entry) componentObject = assign(componentObject, astGenerator(entry));
    const formatedD3Object = d3DataBuilder(componentObject); // building the tree
    renderHtml(formatedD3Object, start); //sending the completed tree to be built and rendered
  })
})()
