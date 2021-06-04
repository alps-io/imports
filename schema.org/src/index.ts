import fs from 'fs';
import path from 'path';
import * as Alps from './alps';
import * as convert from './convert';
import { readProps, readTypes } from './read';

const outputDir = path.join(__dirname, '../output');
fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir);

const fileName = (doc: Alps.Doc) => `${doc.name}.json`;

function writeAlpsDoc(doc: Alps.Doc) {
  const filePath = path.join(outputDir, fileName(doc));
  fs.writeFileSync(filePath, JSON.stringify(doc, null, 2));
}

const toMarkdownList = (docs: Alps.Doc[]): string =>
  docs.map((doc) => `- [\`${doc.name}\`](${fileName(doc)})`).join('\n');

const ontologies = readProps().map(convert.propToAlpsDoc);
const taxonomies = readTypes().map(convert.typeToAlpsDoc);

ontologies.forEach(writeAlpsDoc);
taxonomies.forEach(writeAlpsDoc);

const readme = `
<!-- WARNING: generated document, do not modify directly -->
# Schema.org ALPS Index

This document acts as an index of the ALPS documents generated from Schema.org.

## Table of Contents

- [Properties](#properties)
- [Types](#types)

## Properties

Schema.org properties are generated as standalone ontologies.

${toMarkdownList(ontologies)}

## Types

Schema.org types are generated as taxonomies composed of
[properties](#properties).

${toMarkdownList(taxonomies)}
`.trimStart();

fs.writeFileSync(path.join(outputDir, 'README.md'), readme);
