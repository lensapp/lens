// Workaround for using Typescript in Rollup configutation
// https://stackoverflow.com/questions/54711437/does-rollup-support-typescript-in-rollup-config-file

require('ts-node').register();
module.exports = require('./rollup.config.ts');
