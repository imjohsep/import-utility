# Manufacturing Import Utility

## Setup

```bash
npm install --save august_home 
```

```node
var utilities = require('august_home')
```

### Setup (from cloned repo)

If you cloned this from github use the following commands:

```bash
npm install
npm run compile
```

We just installed all of our dependencies and compiled our package.

Next, run node in the root of the directory.
```bash
node
>
```

We can then import our compiled package from `/lib/index.js` and
try out a few of the features.
```node
var utilities = require('./lib/index.js')
var util = new utilities.ImportUtility()
util.importConfiguration('connect', './configs/connect.csv')
util.importManufacturingData('connect', './data/connect.csv')
```
