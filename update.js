const fs = require('fs')
const axios = require('axios')
const path = require('path')

const URL_PREFIX = 'https://www.iana.org/assignments/media-types/'

const MIME_TYPE_TYPES = [
  'application',
  'audio',
  'font',
  'image',
  'message',
  'model',
  'multipart',
  'text',
  'video',
]

const OUTDIR = 'dist'

const OUTPUT_FILE = `${OUTDIR}/latestUpdate.ts`
const INPUT_DATA_DIR = `${OUTDIR}/inputData`

const capitalize = s => `${s.charAt(0).toUpperCase()}${s.slice(1)}`

const mimeTypeTypeToCapitalized = {}
MIME_TYPE_TYPES.forEach(mimeTypeType => mimeTypeTypeToCapitalized[mimeTypeType] = capitalize(mimeTypeType))

const writeOutput = output => {
  console.log(`\n==> Writing output to ${OUTPUT_FILE}.`)

  if (!fs.existsSync(OUTDIR))
    fs.mkdirSync(OUTDIR, { recursive: true })

  fs.writeFileSync(OUTPUT_FILE, output)
}

const parseInputData = inputData => {
  console.log('\n==> Parsing data.')

  const mimeTypeTypeToMimeTypeList = {}
  inputData.forEach(({ mimeTypeType, data }) => {
    console.log(`--> Parsing data for '${mimeTypeType}'.`)
    const lines = data.split('\n')
    lines.splice(0, 1) // Remove header row
    const mimeTypeList = lines
      .filter(line => line.length > 3)
      .map(line => {
        const name = line.split(',', 1)[0]
        return `${mimeTypeType}/${name}`
      })
      .filter(mimeType => mimeType != null)
    mimeTypeTypeToMimeTypeList[mimeTypeType] = mimeTypeList
    console.log(`--> Parsed ${mimeTypeList.length} entries for '${mimeTypeType}' mime types.`)
  })

  const mimeTypeTypeDecs = Object.entries(mimeTypeTypeToMimeTypeList)
    .map(([mimeTypeType, mimeTypeList]) => [
      `export type ${mimeTypeTypeToCapitalized[mimeTypeType]}MimeType =`,
      `  ${mimeTypeList.map(mimeType => `'${mimeType}'`).join('\n  | ')}`,
    ].join('\n'))

  const allMimeTypeTypeDec = [
    'export type MimeType =',
    `  ${Object.values(mimeTypeTypeToCapitalized).map(capitalizedMimeType => `${capitalizedMimeType}MimeType`).join('\n  | ')}`
  ].join('\n')

  return `${[
    ...mimeTypeTypeDecs,
    allMimeTypeTypeDec,
  ].join('\n\n')}\n`
}

const getInputData = async () => {
  const results = []

  if (!fs.existsSync(INPUT_DATA_DIR))
    fs.mkdirSync(INPUT_DATA_DIR, { recursive: true })


  console.log(`\n==> Getting data.`)
  for (let i = 0; i < MIME_TYPE_TYPES.length; i += 1) {
    const mimeTypeType = MIME_TYPE_TYPES[i]
    console.log(`--> Getting data for '${mimeTypeType}' mime types.`)
    const res = await axios.get(`${URL_PREFIX}${mimeTypeType}.csv`)
    fs.writeFileSync(`${INPUT_DATA_DIR}/${mimeTypeType}.csv`, res.data)
    results.push({ mimeTypeType, data: res.data })
  }
  return results
}

const main = async () => {
  const inputData = await getInputData()
  const output = parseInputData(inputData)
  writeOutput(output)
}

main()
