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
    .map((doc) => `- [\`${doc.name}\`](./${folder}/${fileName(doc)})`)
    .join('\n');

const index = `
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

fs.writeFileSync(path.join(outputDir, 'index.md'), index);
