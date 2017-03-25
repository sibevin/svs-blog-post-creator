#!/usr/bin/env node

const pkg = require('./package.json')
const commander = require('commander')
const sprintf = require('sprintf-js').sprintf
const fs = require('fs');
const path = require('path');

const LogLevel = Object.freeze({
  'EE': 0,
  'FF': 1,
  'II': 2,
  'DD': 3,
})
const DEFAULT_LOG_LEVEL = LogLevel.FF
const TEMPLATES = ['post', 'gem', 'link']
const DEFAULT_TEMPLATE = 'post'
const DEFAULT_PATH = './src/posts'

const listParser = function(val) {
  return val.split(',')
}

const incVerbose = function(val, total) {
  return total + 1
}

const fetchDt = function(val) {
  if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}_[0-9]{2}:[0-9]{2}:[0-9]{2}$/.test(val)) {
    return val.replace('_', ' ')
  } else {
    var currentDt = new Date()
    if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(val)) {
      return sprintf("%s %02i:%02i:%02i",
        val,
        currentDt.getHours(),
        currentDt.getMinutes(),
        currentDt.getSeconds())
    } else if (/^[0-9]{2}:[0-9]{2}:[0-9]{2}$/.test(val)) {
      return sprintf("%i-%02i-%02i %s",
        currentDt.getFullYear(),
        currentDt.getMonth(),
        currentDt.getDate(),
        val)
    } else {
      return sprintf("%i-%02i-%02i %02i:%02i:%02i",
        currentDt.getFullYear(),
        currentDt.getMonth(),
        currentDt.getDate(),
        currentDt.getHours(),
        currentDt.getMinutes(),
        currentDt.getSeconds())
    }
  }
}

const fetchTemplate = function(val) {
  if (val === undefined || TEMPLATES.indexOf(val) < 0) {
    return DEFAULT_TEMPLATE
  } else {
    return val
  }
}

const logPrint = function(level, currentVerbose, msg) {
  if (currentVerbose >= level) {
    console.log(msg)
  }
}

const fetchDefault = function(givenValue, defaultValue) {
  if (givenValue === undefined) {
    return defaultValue
  } else {
    return givenValue
  }
}

const findOrBuildOutputFolder = function(outputPath) {
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath)
  }
}

const fetchSlug = function(givenSlug, title) {
  if (givenSlug === undefined) {
    // TODO: convert title to slgu
  } else {
    return givenSlug
  }
}

const createPostFile = function(postData) {
  var time = postData['dt'].replace(/[- :]/g, '')
  var fileName = postData['dt'].replace(/[- :]/g, '') + '-' + postData['slug']
  // TODO: create post file
}

commander
  .version(pkg.version)
  .usage('[options] <title>')
  .option('-t, --tags <tag1,tag2,tag3>',
    'The post tags.',
    listParser)
  .option('-c, --category <category>',
    'The post category.')
  .option('-s, --slug <slug>',
    'The post url slug.')
  .option('-T, --template <template>',
    '(' + TEMPLATES.join('/') + ') The post template. The default template is ' + DEFAULT_TEMPLATE + ' .')
  .option('-d, --datetime <YYYY-MM-DD_hh:mm:ss>',
    'Change the post creation datetime. You can give date [YYYY-MM-DD] or time [hh:mm:ss] only, the missing parts are replaced with the current date time.')
  .option('-w, --webpage <url>',
    'To create the webpage link on the post title.')
  .option('-p, --path <path>',
    'Where to create the post file. The default path is ' + DEFAULT_PATH + ' .')
  .option('-v, --verbose',
    'Show verbose information.',
    incVerbose, DEFAULT_LOG_LEVEL)
  .parse(process.argv)

var verbose = commander.verbose
var title = commander.args.join(' ')
var template = fetchTemplate(commander.template)
var dt = fetchDt(commander.datetime)
var outputPath = fetchDefault(commander.path, DEFAULT_PATH)
var slug = fetchSlug(commander.slug, title)

logPrint(LogLevel.DD, verbose, {
  'args': commander.args,
  'title': title,
  'tags': commander.tags,
  'category': commander.category,
  'slug': commander.slug,
  'datetime': dt,
  'template': template,
  'webpage': commander.webpage,
  'path': outputPath,
  'verbose': verbose
})

var postData = {
  title: commander.args.join(' '),
  tags: commander.tags,
  category: commander.category,
  slug: slug,
  datetime: dt,
  template: template,
  webpage: commander.webpage,
  path: outputPath,
}

findOrBuildOutputFolder(outputPath)
createPostFile(postData)
