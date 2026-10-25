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

Both examples accept continuation files after the first file:

```sh
node validate.js <file.xaf> <continuation.xaf>
node read-to-memory.js <file.xaf> <continuation.xaf>
```
## Package versions

The samples use one released version of the package, written exactly in `package.json`. Dependabot
(`.github/dependabot.yml`) opens a pull request for each new release, and CI loads every sample against it before it
is merged, so the samples follow the latest version.
