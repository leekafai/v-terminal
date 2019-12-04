/**在public中生成线上版本 */
/* global __dirname require */
const fs = require('fs')
const path = require('path')
const packageFile = require(path.join(__dirname, '../package.json'))
fs.writeFileSync(path.join(__dirname, '../public/version.json'), JSON.stringify({ version: packageFile.version }))