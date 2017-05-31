#!/usr/bin/env node

const pkg = require('./package.json')
const commander = require('commander')
const sprintf = require('sprintf-js').sprintf
const fs = require('fs')
const path = require('path')
const stringToSlug = require('speakingurl')
const mkdirp = require('mkdirp')

const LogLevel = Object.freeze({
  'EE': 0,
  'FF': 1,
  'II': 2,
  'DD': 3,
})
const DEFAULT_LOG_LEVEL = LogLevel.FF
const CATEGORIES = ['coding', 'life', 'tools', 'bm', 'slides']
const DEFAULT_CATEGORY = 'coding'
const TEMPLATES = ['post', 'gem', 'link', 'bm', 'slides']
const DEFAULT_TEMPLATE = 'post'
const DEFAULT_PATH = './src/posts'
const DEFAULT_BM_PATH = './src/bookmarks'
const DEFAULT_SLIDE_PATH = './src/slides'

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
    let currentDt = new Date()
    if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(val)) {
      return sprintf("%s %02i:%02i:%02i",
        val,
        currentDt.getHours(),
        currentDt.getMinutes(),
        currentDt.getSeconds())
    } else if (/^[0-9]{2}:[0-9]{2}:[0-9]{2}$/.test(val)) {
      return sprintf("%i-%02i-%02i %s",
        currentDt.getFullYear(),
        currentDt.getMonth()+1,
        currentDt.getDate(),
        val)
    } else {
      return sprintf("%i-%02i-%02i %02i:%02i:%02i",
        currentDt.getFullYear(),
        currentDt.getMonth()+1,
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

const fetchCategory = function(val) {
  if (val === undefined || CATEGORIES.indexOf(val) < 0) {
    return DEFAULT_CATEGORY
  } else {
    return val
  }
}

const fetchOutputPath = (givenValue, template) => {
  if (givenValue === undefined) {
    switch (template) {
      case 'bm':
        return DEFAULT_BM_PATH
        break
      case 'slides':
        return DEFAULT_SLIDE_PATH
      default:
        // post, link, gem
        return DEFAULT_PATH
    }
  } else {
    return givenValue
  }
}

const logPrint = function(level, currentVerbose, tag, msg) {
  if (currentVerbose >= level) {
    console.log(tag, msg)
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
    let result = mkdirp.sync(outputPath)
    console.log('mkdirp', result)
  }
}

const fetchSlug = function(givenSlug, title) {
  if (givenSlug === undefined) {
    return stringToSlug(title)
  } else {
    return givenSlug
  }
}

const genTemplateMeta = (postData) => {
  let postLines = []
  postLines.push(`.meta-data title ${postData.title}`)
  postLines.push(`.meta-data datetime ${postData.datetime}`)
  postLines.push(`.meta-data tags ${postData.tags}`)
  postLines.push(`.meta-data category ${postData.category}`)
  postLines.push(`.meta-data link ${postData.link}`)
  postLines.push(`.meta-data file ${postData.file}`)
  postLines.push(`.meta-data template ${postData.template}`)
  if (postData.website !== '' && postData.website !== undefined) {
    postLines.push(`.meta-data website ${postData.website}`)
  }
  if (postData.draft === true) {
    postLines.push(`.meta-data draft`)
  }
  postLines.push(`.meta-data end`)
  return postLines.join("\n")
}

const createPostFile = function(postData) {
  let outputPath = path.join(postData.path, `${postData['file']}.slim`)
  // TODO: create post file
  let template = []
  template.push(genTemplateMeta(postData))
  switch (postData.template) {
    case 'gem':
      template.push("\nul")
      template.push(`  li\n    a href="" target="_blank"\n      | Github`)
      template.push(`  li\n    a href="" target="_blank"\n      | RubyGem`)
      template.push(`    code\n      |  ()`)
      template.push(`h1\n  | What`)
      template.push(`h1\n  | Why`)
      template.push(`h1\n  | How`)
      break
    case 'link':
      template = genTemplateLink(postData)
      template.push("\nul")
      template.push(`  li\n    a href="" target="_blank"\n      | Homepage`)
      template.push(`h1\n  | What`)
      template.push(`h1\n  | Why`)
      break
    case 'slides':
      template.push("\nheader.caption")
      template.push("section.slide.no-page-number\n  h2\n    |")
      template.push("section.slide\n  h2\n    |")
      template.push("section.slide\n  h2 Q & A")
      break
    default:
      // post, bm
      template.push("\n\n")
  }
  template = template.join('\n')
  logPrint(LogLevel.DD, verbose, 'template:', template)
  fs.writeFile(outputPath, template, (err) => {
    if (err) {
      throw err
    }
    console.log(`The file is created at: ${outputPath}`)
  })
}

commander
  .version(pkg.version)
  .usage('[options] <title>')
  .option('-t, --tags <tag1,tag2,tag3>',
    'The post tags.',
    listParser)
  .option('-c, --category <category>',
    `(${CATEGORIES.join('/')}) The post category. The default is ${DEFAULT_CATEGORY}.`)
  .option('-s, --slug <slug>',
    'The post url slug.')
  .option('-D, --draft',
    'The post is a draft.')
  .option('-T, --template <template>',
    `(${TEMPLATES.join('/')}) The post template. The default is ${DEFAULT_TEMPLATE}.`)
  .option('-d, --datetime <YYYY-MM-DD_hh:mm:ss>',
    'Change the post creation datetime. You can give date [YYYY-MM-DD] or time [hh:mm:ss] only, the missing parts are replaced with the current date time.')
  .option('-w, --website <url>',
    'To create the website link on the post title. You must provide the website link if the category is bookmark.')
  .option('-p, --path <path>',
    'Where to create the post file. If no path is given, the output path is chosen by the given template.')
  .option('-v, --verbose',
    'Show verbose information.',
    incVerbose, DEFAULT_LOG_LEVEL)
  .parse(process.argv)

let title = commander.args.join(' ')
if (title === '') {
  console.log('You should provide the title.')
  commander.help()
}

let verbose = commander.verbose
let category = fetchCategory(commander.category)
let template = fetchTemplate(commander.template)
let dt = fetchDt(commander.datetime)
let slug = fetchSlug(commander.slug, title)

if (category === 'bm' || category === 'slides') {
  template = category
}

if (category === 'bm' && commander.website === undefined) {
  console.log('You should provide the website if the category is bookmark.')
  commander.help()
}

let outputPath = fetchOutputPath(commander.path, template)

logPrint(LogLevel.DD, verbose, 'original input:', {
  'args': commander.args,
  'title': title,
  'tags': commander.tags,
  'category': category,
  'slug': commander.slug,
  'datetime': dt,
  'template': template,
  'website': commander.website,
  'path': outputPath,
  'verbose': verbose,
  'draft': commander.draft
})

let postData = {
  title: commander.args.join(' '),
  datetime: dt,
  tags: (commander.tags === undefined ? '' : commander.tags.join(',')),
  category: category,
  link: slug,
  file: `${dt.replace(/\ /g, '-').replace(/:/g, '')}-${slug}`,
  template: template,
  website: commander.website,
  path: outputPath,
  draft: commander.draft
}

logPrint(LogLevel.DD, verbose, 'post data:', postData)

findOrBuildOutputFolder(outputPath)
createPostFile(postData)
