(original was a subdirectory in [my-blog2](https://github.com/alpiepho/my-blog2))

This is a simple utilty to build the post "github-summary.mdx".  It uses node and axois.

One wierd thing is the stdout contains the node command line.  Please manually remove
the first 4 lines:
```

> repodata@1.0.0 start /Users/al/Projects/gatsby/my-blog2/repodata
> node build_summary.js

```

or npm start | awk 'NR>4' > github-summary.mdx

Another current issues is a rate limit on the github api.  Currently this is 60/hr
without any authentication.  When athentication is implmented, this should go up to
5000/hr.
 
### TODO

- generate html (like pup-learning)
- refactor with main.js
- add GH Action
