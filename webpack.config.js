const path = require('path');
const tsNameof = require("ts-nameof");
const nodeExternals = require('webpack-node-externals');
const HtmlWebpackPlugin = require('html-webpack-plugin');

let resolve = {
    extensions: [".ts", ".js"],
    alias: {
        '@core': path.join(__dirname, 'src/core'),
        '@transport': path.join(__dirname, 'src/transport'),
        '@users': path.join(__dirname, 'src/users'),
        '@log': path.join(__dirname, 'src/log'),
        '@session': path.join(__dirname, 'src/session'),
        '@lobby': path.join(__dirname, 'src/lobby'),
        '@utils': path.join(__dirname, 'src/utils'),
        '@game': path.join(__dirname, 'src/game')
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


module.exports = [
    {
        mode,
        entry: path.join(__dirname, '/src/test/index.ts'),
        output: {
            filename: 'test.js',
            path: outputDirectory
        },
        devtool: 'inline-source-map',
        devServer: {
            contentBase: 'distr',
            port: 8081
        },
        plugins: [
            new HtmlWebpackPlugin({
              title: 'Development'
            })
          ],
        module: {
            rules
        },
        resolve
    },
    {
	mode,
    entry: serverEntry,
    target: "node",
    externals: [nodeExternals()],
    output: {
        filename: serverOutputFilename,
        path: outputDirectory
    },
    devtool: 'inline-source-map',
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
    devtool: 'inline-source-map',
    module: {
        rules
    },
    resolve
}
]
.filter(config => process.env.config ? config.output.filename === process.env.config : true);