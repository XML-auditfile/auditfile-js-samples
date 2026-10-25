// Validates an audit file: XSD, structure, keys and business rules.
// Usage: node validate.js <file.xaf> [--en] [--unverified] [--force xaf/3.2]
// Exit code: 0 valid, 1 not valid, 2 usage error.

import { createReadStream } from 'node:fs';
import { basename } from 'node:path';
import { Auditfile, AuditfileSource, AuditfileVersion, DiagnosticSeverity, ReadMode, TextLanguage } from '@xml-auditfile/auditfile';

const usage = 'Usage: node validate.js <file.xaf> [--en] [--unverified] [--force xaf/3.2]';
const args = process.argv.slice(2);
const forceIndex = args.indexOf('--force');
const files = args.filter((a, i) => !a.startsWith('--') && (forceIndex < 0 || i !== forceIndex + 1));
if (files.length === 0 || (forceIndex >= 0 && forceIndex + 1 >= args.length)) {
    console.error(usage);
    process.exit(2);
}

let version = null;
if (forceIndex >= 0) {
    version = AuditfileVersion.find(args[forceIndex + 1]);
    if (version === null) {
        console.error(`Unknown version '${args[forceIndex + 1]}'. Known: ${AuditfileVersion.all.map((v) => v.key).join(', ')}.`);
        process.exit(2);
    }
}

const options = {
    language: args.includes('--en') ? TextLanguage.English : TextLanguage.Dutch,
    mode: args.includes('--unverified') ? ReadMode.Unverified : ReadMode.Verified,
    version,
};

// The reader never opens files itself: hand it a stream factory per part.
const source = AuditfileSource.fromFactories(...files.map((path) => [basename(path), () => createReadStream(path)]));

// Unverified skips the XSD but runs every other check.
const report = await Auditfile.validate(source, options);

for (const diagnostic of report.diagnostics) {
    console.log(String(diagnostic));
}

// The counts include diagnostics left out of a long list.
const errors = report.count(DiagnosticSeverity.Error) + report.count(DiagnosticSeverity.Fatal);
console.log(`${errors} errors, ${report.count(DiagnosticSeverity.Warning)} warnings`);
process.exitCode = report.isValid ? 0 : 1;
