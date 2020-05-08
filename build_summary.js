// TODO: create token and get private repos (WARNING: still cant get private repos, see private.json as workaround)
// TODO: roll this to "better gh profile page???"

var axios = require("axios")

var MAX_GHAPI_PAGEPER = 100
var MAX_GHAPI_MAXPAGES = 2
var github_base =
  "https://api.github.com/users/alpiepho/repos?per_page=" +
  MAX_GHAPI_PAGEPER +
  "&page="

header =
  '\
---\n\
title: Github Repos\n\
date: "2020-04-18"\n\
description: "Summary of my Github Repos"\n\
---\n\
\n\
(Warning: many images) This a summary of all the Github Repos I have added over the years.  Some are forks of other projects with minor changes.  Most are orignal works.\n\
'

// these are extra notes to be aded to the generated summary page based on the repo name
extraFields = require('./extra.json')
privateRepos = [] //require('./private.json')

function inExtra(name) {
  for (i = 0; i < extraFields.length; i++) {
    if (name.trim() == extraFields[i].name.trim())
      return [extraFields[i].notes, extraFields[i].ideas]
  }
  return ["", ""]
}

function addExtra(array) {
  array.forEach((element) => {
    [element.notes, element.ideas] = inExtra(element.name)
  })
}

// github api isnt letting em get private repos, created private.json by hand
function addPrivate(array) {
  privateRepos.forEach((element) => {
    array.push(element)
  })
}

function sortByKey(array, key) {
  return array.sort(function (a, b) {
    var x = a[key].toLowerCase()
    var y = b[key].toLowerCase()
    return x < y ? -1 : x > y ? 1 : 0
  })
}

function getCounts(array) {
  privateCount = 0
  publicCount = 0
  forkCount = 0
  array.forEach((element) => {
    if (element.private) privateCount += 1
    if (!element.private) publicCount += 1
    if (element.fork) forkCount += 1
  })
  return [privateCount, publicCount, forkCount]
}

function finish(header, jsonData) {
  addExtra(jsonData)
  addPrivate(jsonData)
  jsonData = sortByKey(jsonData, "name")

  let privateCount, publicCount, forkCount
  [privateCount, publicCount, forkCount] = getCounts(jsonData)
  publicCount -= forkCount

  header +=
    "\
  \n\
  **NOTE:** This page is generated from a set of JSON data gathered from Github.\n\
  \n\
  **NOTE:** This lists " +
    jsonData.length +
    " repos total, " + forkCount + " forked, and " + publicCount + " my public.\n\
  \n\
  \n"

  console.log(header)

  // DEBUG: dump names in order so they can be cut/paste
  // jsonData.forEach(element => {
  //   console.log("  {");
  //   console.log("    \"name\": \"" + element.name + "\",");
  //   //console.log("    \"description\": \"" + element.description + "\",");
  //   [ notes, ideas ] = inExtra(element.name);
  //   console.log("    \"notes\": \"" + notes + "\",");
  //   console.log("    \"ideas\": \"" + ideas + "\"");
  //   console.log("  },");
  // });

  jsonData.forEach((element, index) => {
    preString = ""
    if (element.fork)
      preString = '<span style="color:orange;font-weight:200">[fork]</span> '
    if (element.private)
      preString = '<span style="color:orange;font-weight:200">[private]</span> '
    languageStr = ""
    if (element.language)
      languageStr =
        '<span style="color:grey;font-weight:200">[' +
        element.language.toLowerCase() +
        "]</span> "
    console.log(
      "### " + (index + 1) + ") " + preString + element.name + languageStr
    )
    if (element.png) {
      console.log(
        "[](../assets/github-repos__screenshot-" + element.id + ".png)"
      )
    }
    if (element.hasREADMEmd) {
      console.log(
        "[" + element.name + "](" + element.html_url + "/blob/master/README.md)"
      )  
    } else {
      console.log(
        "[" + element.name + "](" + element.html_url + ")"
      )  
    }
    description = "(see link)"
    if (element.description) description = element.description
    console.log(": " + description)
    if (element.notes) console.log("- " + element.notes)
    if (element.ideas) console.log("- " + element.ideas)
    console.log("")
  })
}

let options = {}
if (process.env.GH_API_TOKEN) {
  options = {
    headers: { 'Authorization': 'token ' + process.env.GH_API_TOKEN }
  }
}

let promises = []
let jsonData = []
for (i = 1; i <= MAX_GHAPI_MAXPAGES; i++) {
  promises.push(
    axios.get(github_base + i, options).then((response) => {
      response.data.forEach((element) => {
        jsonData.push(element)
      })
    })
    .catch(error => {
      console.log(error.response.data)
      //console.log(error)
    })
  )
}

//DEBUG: if you want to skip gathe of API above and the Promise.all below
// this is cut/paste from running the following, manually in a browser
// https://api.github.com/users/alpiepho/repos?per_page=100&page=1
// https://api.github.com/users/alpiepho/repos?per_page=100&page=2
// let jsonData = require('./list.json')

Promise.all(promises).then(() => {
  //DEBUG: if you skip README check
  //finish(header, jsonData)
  let promises = []
  jsonData.forEach(element => {
    //console.log(element.html_url + "/blob/master/README.md")
    promises.push(
      axios.get(element.html_url + "/blob/master/README.md").then((response) => {
        //console.log(element.html_url + " has a README")
        element.hasREADMEmd = true
      })
      .catch(error => {})
    )
  })
  Promise.all(promises).then(() => finish(header, jsonData))
})
