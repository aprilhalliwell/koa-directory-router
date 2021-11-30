#  koa-directory-router
Utility for generating routes based on directory structure while reducing the boilerplace required for setting up koa-routers.

## Installation
```
git pull https://github.com/aprilhalliwell/koa-directory-router.git
```

## Usage
### Example Directory Structure
```
root
|- routes
|  |- api
|     |- v1
|     |  |- file1.js
|     |- v2
|        |- file2.js
|- start.js 
```

**file1.js**
``` js
const Router = require('koa-router'); //include koa-router
const router = module.exports = new Router(); // this line is required for the script to add these routes
router
  .get('/', async ctx => ctx.body = 'OK')
  .get('/inner', async ctx => ctx.body = 'OK');
```

**file2.js**
``` js
const Router = require('koa-router'); //include koa-router
const router = module.exports = new Router(); // this line is required for the script to add these routes
router
  .post('/route/with/nested/structure', async ctx => ctx.body = 'OK');
```

**start.js**
``` js
const path = require('path');
const Koa = require('koa');
const app = new Koa();
const { routes } = require('koa-directory-router')(path.join(__dirname, 'routes')); //'routes' is the top level folder in the directory where all routes are housed 
app.use(routes); 
app.listen(8080);
```
## API
---

### routes
Koa middleware for routing requests
``` js
const { routes } = require('koa-directory-router')(path.join(__dirname, 'routes'));
app.use(routes);
```
Or pass in your own router regex.
``` js
const { routes } = require('koa-directory-router')(path.join(__dirname, 'routes', new RegExp(/var router = module\.exports = new Router\(\)/) )));
app.use(routes);
```
---

## Change History
- v1.0.0 (2021-11-29)
  - Initial Release.