
var axios = require("axios")
var fs = require('fs');

var GHAPI_TYPE = 'public' // all, public
var MAX_GHAPI_PAGEPER = 100
var MAX_GHAPI_MAXPAGES = 2
var github_base_public =
  "https://api.github.com/users/alpiepho/repos?type=" +
  GHAPI_TYPE +
  "&per_page=" +
  MAX_GHAPI_PAGEPER +
  "&page="

var github_base_private =
  "https://api.github.com/user/repos?type=" +
  GHAPI_TYPE +
  "&per_page=" +
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

// github api isnt letting me get private repos, created private.json by hand
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



function finishMDX(header, jsonData) {
  addExtra(jsonData)
  addPrivate(jsonData)
  jsonData = sortByKey(jsonData, "name")

  let privateCount, publicCount, forkCount
  [privateCount, publicCount, forkCount] = getCounts(jsonData)
  publicCount -= forkCount

  fileData = ""

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

  fileData += header + "\n"

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
    fileData += "### " + (index + 1) + ") " + preString + element.name + languageStr + "\n"
    if (element.png) {
      fileData += "[](../assets/github-repos__screenshot-" + element.id + ".png)" + "\n"
    }
    if (element.hasREADMEmd) {
      fileData += "[" + element.name + "](" + element.html_url + "/blob/master/README.md)" + "\n"
    } else {
      fileData += "[" + element.name + "](" + element.html_url + ")" + "\n"
    }
    description = "(see link)"
    if (element.description) description = element.description
    fileData += ": " + description + "\n"
    if (element.notes) fileData += "- " + element.notes + "\n"
    if (element.ideas) fileData += "- " + element.ideas + "\n"
    fileData += "" + "\n"
  })

  if (GHAPI_TYPE == "all")
  fs.writeFileSync("github-summary-all.mdx", fileData)
  if (GHAPI_TYPE == "public")
    fs.writeFileSync("github-summary.mdx", fileData)
}


function finishSpecialReadme(header, jsonData) {
  // addExtra(jsonData)
  // addPrivate(jsonData)
  jsonData = sortByKey(jsonData, "name")
  //console.log(JSON.stringify(jsonData, null, 2))

  let privateCount, publicCount, forkCount
  [privateCount, publicCount, forkCount] = getCounts(jsonData)
  publicCount -= forkCount

  if (GHAPI_TYPE == "all")
    privateDetails = "" + privateCount + " Private, ";
  fs.writeFileSync("README_all_repos.md", fileData)
  if (GHAPI_TYPE == "public")
    privateDetails = "";

  fileData = ""
  fileData += "\n### All Public Repositories Alphabetically\n\n(" + 
                jsonData.length + " Total, " + publicCount + " Public, " + privateDetails + forkCount + " Forks)<br>\n"
  today = new Date()
  fileData += "<sup><sub>(updated " + today + ")</sub></sup>\n"
  fileData += "\n"

  jsonData.forEach((element, index) => {
    subscriptStr = "(public)"
    if (element.fork) subscriptStr = "(fork)"
    if (element.private) subscriptStr = "(private)"
    if (element.hasREADMEmd) {
      fileData += "[" + element.name + "](" + element.html_url + "/blob/master/README.md) <sup><i>" + subscriptStr + "</i></sup> <br>" + "\n"
    } else {
      fileData += "[" + element.name + "](" + element.html_url + ") <sup><i>" + subscriptStr + "</i></sup> <br>" + "\n"
    }
    description = "(see link)"
    if (element.description) description = element.description
    fileData += description + "<br>" + "\n"

    switch(element.language) {
      case "C":
        fileData += "![##545454](http://placehold.it/15/545454/000000?text=+) C<br>" + "\n"
        break;
      case "C++":
        fileData += "![##F34B7C](http://placehold.it/15/f34b7/000000?text=+) C++<br>" + "\n"
        break;
      case "C#":
        fileData += "![##178600](http://placehold.it/15/178600/000000?text=+) C#<br>" + "\n"
        break;
      case "CSS":
        fileData += "![##58407E](http://placehold.it/15/58407e/000000?text=+) CSS<br>" + "\n"
        break;
      case "Dart":
        fileData += "![##89C051](http://placehold.it/15/00b4ab/000000?text=+) Dart<br>" + "\n"
        break;
        case "Go":
        fileData += "![##00ADD8](http://placehold.it/15/00add8/000000?text=+) Go<br>" + "\n"
        break;
      case "HTML":
        fileData += "![##E34C27](http://placehold.it/15/e34c27/000000?text=+) HTML<br>" + "\n"
        break;
      case "Java":
        fileData += "![##B07218](http://placehold.it/15/b07218/000000?text=+) Java<br>" + "\n"
        break;
      case "JavaScript":
        fileData += "![#F1E05A](http://placehold.it/15/f1e05a/000000?text=+) JavaScript<br>" + "\n"
        break;
      case "PHP":
        fileData += "![##4F5D94](http://placehold.it/15/4f5d94/000000?text=+) PHP<br>" + "\n"
        break;
      case "Python":
        fileData += "![##3571A5](http://placehold.it/15/3571a5/000000?text=+) Python<br>" + "\n"
        break;
      case "Shell":
        fileData += "![##89C051](http://placehold.it/15/89e051/000000?text=+) Shell<br>" + "\n"
        break;
        case "TypeScript":
        fileData += "![##2B7489](http://placehold.it/15/2b7489/000000?text=+) TypeScript<br>" + "\n"
        break;
      case "Jupyter Notebook":
        fileData += "![##DA5B0A](http://placehold.it/15/da5b0a/000000?text=+) Jupyter Notebook<br>" + "\n"
        break;
      default:
        fileData += "![#000000](http://placehold.it/15/000000/000000?text=+) unknown language<br>" + "\n"
        break;
    }
    //TODO fix this
    // localDate = Date(element.updated_at);
    // console.log(element.updated_at)
    // console.log(localDate.toString())
    localDate = element.updated_at;
    fileData += "<sup><sub>" + localDate + "</sub></sup><br>" + "\n"

    // if (element.notes) fileData += "- " + element.notes + "\n"
    // if (element.ideas) fileData += "- " + element.ideas + "\n"
    fileData += "\n"
  })
  if (GHAPI_TYPE == "all")
    fs.writeFileSync("README_all_repos.md", fileData)
  if (GHAPI_TYPE == "public")
    fs.writeFileSync("README_public_repos.md", fileData)
}


/////////////////////////////////////////////////
// MAIN
/////////////////////////////////////////////////
let github_base = github_base_public
let options = {}
if (process.env.GH_API_TOKEN) {
  github_base = github_base_private
  options = {
    headers: { 
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': 'token ' + process.env.GH_API_TOKEN,
   }
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

//DEBUG: if you want to skip gather of API above and the Promise.all below
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
  Promise.all(promises).then(() => {
    finishMDX(header, jsonData);
    finishSpecialReadme(header, jsonData);
  })
})
