import fs from 'fs';
import path from 'path';
import * as Alps from './alps';
import * as convert from './convert';
import { readProps, readTypes } from './read';

const outputDir = path.join(__dirname, '../output');
fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir);

const fileName = (doc: Alps.Doc) => `${doc.name}.json`;

function writeAlpsDoc(doc: Alps.Doc, dir: string): void {
  const filePath = path.join(dir, fileName(doc));
  fs.writeFileSync(filePath, JSON.stringify(doc, null, 2));
}

function writeAlpsDocs(docs: Alps.Doc[], folder: string): void {
  const dir = path.join(outputDir, folder);
  fs.mkdirSync(dir);
  docs.forEach((doc) => writeAlpsDoc(doc, dir));
}

const ontologies = readProps().map(convert.propToAlpsDoc);
const taxonomies = readTypes().map(convert.typeToAlpsDoc);

writeAlpsDocs(ontologies, 'properties');
writeAlpsDocs(taxonomies, 'types');

const toMarkdownList = (docs: Alps.Doc[], folder: string): string =>
  docs.map((doc) => `- [\`${doc.name}\`](./${folder}/${fileName(doc)})`).join('\n');

const readme = `
<!-- WARNING: generated document, do not modify directly -->
# Schema.org ALPS Index

This document acts as an index of the ALPS documents generated from Schema.org.

## Table of Contents

- [Properties](#properties)
- [Types](#types)

## Properties

Schema.org properties are generated as standalone ontologies.

${toMarkdownList(ontologies, 'properties')}

## Types

Schema.org types are generated as taxonomies composed of
[properties](#properties).

${toMarkdownList(taxonomies, 'types')}
`.trimStart();

fs.writeFileSync(path.join(outputDir, 'README.md'), readme);
