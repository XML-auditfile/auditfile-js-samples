// Adds your own dialect and view, in the format of auditfile-spec, reads an audit file and runs the view.
// Usage: node custom-definitions.js <file.xaf> [continuation files...]

import { createReadStream, readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { Auditfile, AuditfileSource, Decimal, MemorySink, TextLanguage } from '@xml-auditfile/auditfile';

// The definitions sit next to the built-in ones of the package; a file is refused as a whole when anything is wrong.
// The reader never opens files itself, so read the JSON and hand over the text (or the parsed object).
// They are added before the arguments are checked, so a run without arguments still checks definitions/.
const definitions = new URL('./definitions/', import.meta.url);
const dialects = Auditfile.dialects.add('xaf/3.2', readFileSync(new URL('dialects.json', definitions), 'utf8'));
const views = Auditfile.views.add(readFileSync(new URL('views.json', definitions), 'utf8'));
console.log(`Added    : dialect ${dialects.map((d) => d.name).join(', ')}; view ${views.map((v) => v.name).join(', ')}`);

const files = process.argv.slice(2);
if (files.length === 0) {
    console.log('Usage: node custom-definitions.js <file.xaf> [continuation files...]');
    process.exit(2);
}

const sink = new MemorySink();
const source = AuditfileSource.fromFactories(...files.map((path) => [basename(path), () => createReadStream(path)]));
const report = await Auditfile.read(source, sink);

// An added dialect is recognized like a built-in one: by namespace or by header/softwareDesc.
console.log(`Version  : ${report.schema?.versionKey ?? '-'} (${report.schema?.source ?? '-'})`);
console.log(`Dialect  : ${report.schema?.dialect ?? '-'}`);
console.log(`Loaded   : ${report.loaded}`);

// An added view is found like a built-in one; a view that does not fit the version reports XAF-Q001.
const view = report.loaded ? report.schema?.version?.findView('account_activity') : null;
if (view) {
    // Parameters filter the input rows; null leaves a filter out.
    const result = sink.run(view, { period_from: null, period_to: null }, TextLanguage.English);
    console.log();
    console.log(`${view.label?.get(TextLanguage.English) ?? view.name} (${result.rows.length} rows)`);
    for (const diagnostic of result.diagnostics) {
        console.log(`  ${diagnostic}`);
    }

    printTable(result, 20);
}

console.log();
for (const diagnostic of report.diagnostics) {
    console.log(String(diagnostic));
}

console.log(report.isValid ? 'Valid.' : 'Not valid.');
process.exitCode = report.isValid ? 0 : 1;

function printTable(result, maxRows) {
    const width = 16;
    const numeric = result.columns.map((_, i) => result.rows.some((r) => r[i] instanceof Decimal || typeof r[i] === 'number'));
    const line = (values) => `  ${values.map((v, i) => {
        const text = v.length > width ? `${v.slice(0, width - 1)}…` : v;
        return numeric[i] ? text.padStart(width) : text.padEnd(width);
    }).join('  ')}`;

    console.log(line(result.columns.map((c) => c.label?.get(TextLanguage.English) ?? c.name)));
    for (const row of result.rows.slice(0, maxRows)) {
        console.log(line(row.map((v) => (v === null ? '' : String(v)))));
    }

    if (result.rows.length > maxRows) {
        console.log(`  … ${result.rows.length - maxRows} more`);
    }
}
