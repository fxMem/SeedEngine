const path = require('path');
const tsNameof = require("ts-nameof");
const nodeExternals = require('webpack-node-externals');

let resolve = {
    extensions: [".ts", ".js"],
    alias: {
        '@core': path.join(__dirname, 'src/core'),
        '@transport': path.join(__dirname, 'src/transport'),
        '@users': path.join(__dirname, 'src/users'),
        '@log': path.join(__dirname, 'src/log'),
        '@session': path.join(__dirname, 'src/session'),
        '@utils': path.join(__dirname, 'src/utils'),
    }
};

let serverEntry = path.join(__dirname, '/src/app.ts');
let clientEntry = path.join(__dirname, '/src/client/index.ts');

let outputDirectory = path.join(__dirname, '/distr');

let clientOutputFilename = 'client.js';
let serverOutputFilename = 'server.js';

let mode = 'development';

let rules = [{
        test: /\.tsx?$/,
        use: [{
            loader: 'ts-loader', 
            options: {
              getCustomTransformers: () => ({ before: [tsNameof] })
            }
          }]
    },
];

module.exports = [{
	mode,
    entry: serverEntry,
    target: "node",
    externals: [nodeExternals()],
    output: {
        filename: serverOutputFilename,
        path: outputDirectory
    },
    module: {
        rules
    },
    resolve
},
{
	mode,
    entry: clientEntry,
    output: {
        filename: clientOutputFilename,
        path: outputDirectory
    },
    module: {
        rules
    },
    resolve
}];