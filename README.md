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