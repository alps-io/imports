import fs from 'fs';
import path from 'path';
import * as Alps from './alps';
import * as convert from './convert';
import { readProps, readTypes } from './read';

const outputDir = path.join(__dirname, '../output');
const propsDir = path.join(outputDir, 'properties');
const typesDir = path.join(outputDir, 'types');
[propsDir, typesDir].forEach(dir => {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir);
})

const fileName = (doc: Alps.Doc) => `${doc.name}.json`;

function writeAlpsDoc(doc: Alps.Doc, dir: string): void {
  const filePath = path.join(dir, fileName(doc));
  fs.writeFileSync(filePath, JSON.stringify(doc, null, 2));
}

const writeAlpsDocs = (docs: Alps.Doc[], dir: string) =>
  docs.forEach((doc) => writeAlpsDoc(doc, dir));

const ontologies = readProps().map(convert.propToAlpsDoc);
const taxonomies = readTypes().map(convert.typeToAlpsDoc);

writeAlpsDocs(ontologies, propsDir);
writeAlpsDocs(taxonomies, typesDir);

const toMarkdownList = (docs: Alps.Doc[], folder: string): string =>
  docs
    .map((doc) => `<li><a href="${folder}/${fileName(doc)}">${doc.name}</a></li>`)
    .join('\n');

const index = `
<!-- WARNING: generated document, do not modify directly -->
<html lang="en">
<head>
    <title>Schema.org ALPS Index</title>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.0.0/github-markdown.min.css">
    <style>
        .markdown-body {
            box-sizing: border-box;
            margin: 0 auto;
            padding: 25px;
        }
    
        @media (max-width: 767px) {
            .markdown-body {
                padding: 15px;
            }
        }
    </style>
</head>
<body>
<div class="markdown-body">

<h1>Schema.org ALPS Index</h1>

<p>This document acts as an index of the ALPS documents generated from Schema.org.</p>

<h2>Table of Contents</h2>

<li><a href="#properties">Properties</a></li>
<li><a href="#types">Types</a></li>

<h2 id="properties">Properties</h2>

<p>Schema.org properties are generated as standalone ontologies.</p>

${toMarkdownList(ontologies, 'properties')}

<h2 id="types">Types</h2>

<p>Schema.org types are generated as taxonomies composed of
[properties](#properties).</p>

${toMarkdownList(taxonomies, 'types')}
</div>
</body>
</html>
`.trimStart();

fs.writeFileSync(path.join(outputDir, 'index.html'), index);
