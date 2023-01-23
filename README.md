# mime-type-typescript

This tool grabs the latest MIME type list from [iana's website](https://www.iana.org/assignments/media-types/media-types.xhtml) and parses them to neat Typescript union-type type declarations of all possible MIME types. These types can then be ported to your projects.

## Usage

Latest update available at [./dist/latestUpdate.ts](./dist/latestUpdate.ts)

### From Source

Clone this repository.

Run `npm i` to install NPM dependencies.

Run `npm run update` to run the update script.

Observe new type declarations at `/dist/latestUpdate.ts`
