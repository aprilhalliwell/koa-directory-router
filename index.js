const fs = require('fs');
const path = require('path');
const compose = require('koa-compose');

//recrusive function to go over the directory structure and build out the routes
function findRoutes(directory, options) {
  //we have two options, the filepattern which is a regex used to determine if a file is a valid option
  //then the routerPattern is used to check if a file is a valid koa router.
  const {filePattern, routerPattern} = options;
  return fs.readdirSync(directory).reduce((acc, node) => {
    const fullPath = path.join(directory, node);
    if (fs.statSync(fullPath).isDirectory()) { //if this is a directory we need to go deeper, also means that we will be returning an array
      acc.push(...findRoutes(fullPath, options)); //spread array and add items back to the accumulator
    } else if (filePattern.test(node) && routerPattern.test(fs.readFileSync(fullPath).toString())) { //check if the file matches the patterns
      acc.push(fullPath);//this is a base file
    }
    return acc;
  }, []);
}

module.exports = (routesDirectory, routerPattern = new RegExp(/const router = module\.exports = new Router\(\)/), debug = false) => {
  const endpoints = {}; //used to keep track of found routes.
  return {
    routes: compose(findRoutes(routesDirectory, {
      filePattern: new RegExp(/.js$/), //ensure all route files are js files
      routerPattern //define regex for detecting rotues
    }).map(file => {
      const router = require(file); //require the detected file
      router.prefix(file.slice(routesDirectory.length, file.length - 3).replace(/\\/g, '/'));//prefix route with file name without the extension
      router.stack.forEach(layer => { //go over each route in the router and ensure they are unique
        if (layer.methods.length === 0) return; //if this layer has no methods early out
        const endpoint = layer.path.replace(/\/$/, '');
        const method = layer.methods[layer.methods.length - 1];
        if (!(endpoint in endpoints)) endpoints[endpoint] = []; //default key to empty array
        if (endpoints[endpoint].includes(method)) throw new Error(`Duplicate route: ${method} ${endpoint}`); //throw error if there are multiple routes with the same path
        if (debug) console.log(`Route: ${method} ${endpoint}`) //log routes
        endpoints[endpoint] = endpoints[endpoint].concat(method);
      });
      return compose([router.routes(), router.allowedMethods()]);
    }))
  };
};
