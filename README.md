# auditfile-js-samples

Install the Auditfile package:

```sh
npm i @xml-auditfile/auditfile
```

The examples use the package directly and require Node.js 20 or newer.

Validate an Auditfile:

```sh
node validate.js <file.xaf>
```

Read an Auditfile into memory and print its contents:

```sh
node read-to-memory.js <file.xaf>
```

Add your own dialect and view, read an Auditfile and run the view:

```sh
node custom-definitions.js <file.xaf>
```

The definitions are in `definitions/`, in the same format as `dialects.json` and `views/<type>.json` of
[auditfile-spec](https://github.com/XML-auditfile/auditfile-spec): `dialects.json` reads files of a package that writes
XAF 3.2 in a deviating namespace with decimal commas, `views.json` adds the view `account_activity` (lines, debit and
credit per account, optionally over a range of periods). The sample adds them with `Auditfile.dialects.add('xaf/3.2', json)`
and `Auditfile.views.add(json)`; after that the package uses them like its built-in dialects and views. Change the files
or add your own: a file with an error is refused as a whole, with a message that names the problem.

All examples accept continuation files after the first file:

```sh
node validate.js <file.xaf> <continuation.xaf>
node read-to-memory.js <file.xaf> <continuation.xaf>
node custom-definitions.js <file.xaf> <continuation.xaf>
```
## Package versions

The samples use one released version of the package, written exactly in `package.json`. Dependabot
(`.github/dependabot.yml`) opens a pull request for each new release, and CI loads every sample against it before it
is merged, so the samples follow the latest version.
