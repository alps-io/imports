# Schema.org Imports

The Schema.org imports are automatically generated from their
[vocabulary definition files][vdf]. Specifically, we utilize the CSV format of
the `schemaorg-current-https` files. These are currently downloaded and saved
manually in this directory.

[vdf]: https://schema.org/docs/developers.html#defs

The generated ALPS documents are written to the [output](./output) directory.
Since the number of generated documents is large, we generate a
[README](./output/README.md) to act as an index.

## Running the Generator

Before running the generator, be sure you have the latest LTS version of
[Node.js] installed. You'll also want to be sure you have the latest CSV
[vocabulary definition files][vdf] from Schema.org.

[Node.js]: https://nodejs.org/en

Once you have that setup, `cd` into the project directory (this directory) and
run `npm install` to download all the project dependencies. Finally, run
`npm start` to generate the ALPS documents from the Schema.org vocabulary
definition files.
