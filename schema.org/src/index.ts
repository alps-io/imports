import fs from 'fs';
import path from 'path';
import * as Alps from './alps';
import * as convert from './convert';
import { readProps, readTypes } from './read';

const outputDir = path.join(__dirname, '../output');
fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir);

function writeAlpsDoc(doc: Alps.Doc) {
  const filePath = path.join(outputDir, `${doc.fileName}.json`);
  fs.writeFile(filePath, JSON.stringify(doc, null, 2), (err) => {
    if (err) throw err;
  });
}

readProps().map(convert.propToAlpsDoc).forEach(writeAlpsDoc);
readTypes().map(convert.typeToAlpsDoc).forEach(writeAlpsDoc);
