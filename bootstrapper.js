// install babel hooks in the main process
require('babel-core/register');
require("babel-polyfill");
require('./main.js');