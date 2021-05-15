import parse from 'csv-parse/lib/sync';
import fs from 'fs';
import * as Schema from './schema.org';

function readCsv<T>(path: fs.PathLike, onRecord: OnRecordFn<T>): T[] {
  const csv = fs.readFileSync(path, 'utf-8');
  return parse(csv, { columns: true, onRecord });
}

type OnRecordFn<T> = (record: Record<string, string>) => T;

export const readProps = (): Schema.Prop[] =>
  readCsv('schemaorg-current-https-properties.csv', (record) => ({
    id: record.id,
    label: record.label,
    rangeIncludes: record.rangeIncludes.split(/,\s+/)
  }));

export const readTypes = (): Schema.Type[] =>
  readCsv('schemaorg-current-https-types.csv', (record) => ({
    id: record.id,
    label: record.label,
    properties: record.properties === '' ? [] : record.properties.split(/,\s+/)
  }));
