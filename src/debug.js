const colors = require('colors');
const config = require('./config');
const path = require('path');
const {format} = require('util');
module.exports = (msg, variable) => {
  const parentModule = path.basename(module.parent.filename, '.js');
  if (!config.DEBUG) {
    return false;
  }

  console.log(format('%s [%s]: %s %s %s'), colors.gray('DEBUGGING'), colors.green(parentModule), colors.cyan(variable), colors.gray('<--->'), colors.cyan(JSON.stringify(msg)));
};
