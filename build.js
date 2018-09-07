const fs = require('fs')
const mustache = require('mustache')
const winston = require('winston')
const logger = new winston.Logger({
  transports: [
    new (winston.transports.Console)({
      timestamp: true
    })
  ]
})
logger.cli()


// load templates
let templates = new Map()
const resourcesPath = 'resources/templates'
fs.readdirSync(resourcesPath).forEach(fileName => {
  logger.info("Loading template: %s", fileName)
  const templateName = fileName.split('.')[0];
  templates.set(templateName, fs.readFileSync(resourcesPath + '/' + fileName, { encoding: 'utf8' }))
})

logger.info()

// load params
let envParams = new Map()
const paramsPath = 'resources/envs';
fs.readdirSync(paramsPath).forEach(fileName => {
  logger.info("Loading params: %s", fileName)
  const jsonString = fs.readFileSync(paramsPath + '/' + fileName, { encoding: 'utf8' });
  const env = fileName.split('-')[0];
  envParams.set(env, JSON.parse(jsonString, { encoding: 'utf8' }))
})

logger.info()

// store files
envParams.forEach((param, env) => {
  templates.forEach((templateValue, templateName) => {
    const output = mustache.render(templateValue, param)
    const fileName = templateName + '-' + env + '.json'
    logger.info("Storing file: %s", fileName)
    const envDir = 'build/' + env;
    if (!fs.existsSync(envDir)) {
      fs.mkdirSync(envDir)
    }
    fs.writeFileSync(envDir + '/' + fileName, output)
  })
})