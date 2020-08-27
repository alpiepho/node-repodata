(original was a subdirectory in [my-blog2](https://github.com/alpiepho/my-blog2))

This is a simple utilty that was started to build the post "github-summary.mdx" for my
[blog](https://alpiepho.github.io/my-blog2/).  It uses node and axois.

This has evolved to generate:
- github-summary.mdx
- SpecialReadme.md
- github-summary-all.mdx
- SpecialReadmeAll.md

github-summary.mdx - is the blog post mentioned above.  When generated, the file is manually added to the
repo for the blog.

SpeicalReadme.md - is the public repo list in a markdown form.  This started out as the contents for the
new Github "Special" REAME.md (in repo {User}/{User}) that gets shown in at the top of a Github overview
page for the User.  (That [repo](https://github.com/alpiepho/AlPiepho) also evolved, with a form of this
build_summary.js script ported and used with GH Actions to rebuild the public form of SpecialReadme.md
every 30 minutes...nedd to slow that down).

github-summary-all.mdx - is the same as github-summary.mdx, but generated with the var GHAPI_TYPE set to
all.  This generates the blog post entry with both public and private repos.  This file is not committed
here.

SpecialReadmeAll.md - is the same as SpecialReadme.md, but generated with the var GHAPI_TYPE set to
all.  This generates with both public and private repos.  This file is not committed
here.  The conents of this file are added to a private repo, [AllReposList](https://github.com/alpiepho/AllReposList), which is private.
Bottom line, this lets me add a link from the public "Special Readme", that should only be accessible by myself.


NOTE: Another current issues is a rate limit on the github api.  Currently this is 60/hr
without any authentication.  When athentication is implmented, this should go up to
5000/hr.
 
### TODO

- add user as environment variable
- generate html (like pup-learning)
- refactor with main.js
- add GH Action
