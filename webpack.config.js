const path = require('path');
const tsNameof = require("ts-nameof");
const nodeExternals = require('webpack-node-externals');
const HtmlWebpackPlugin = require('html-webpack-plugin');

let serverEntry = path.join(__dirname, '/src/server/index.ts');
let clientEntry = path.join(__dirname, '/src/client/index.ts');

let outputDirectory = path.join(__dirname, 'distr');
let clientOutputDirectory = outputDirectory;

let clientOutputFilename = 'client.js';
let serverOutputFilename = 'server.js';

let mode = 'development';

let resolve = {
    extensions: [".ts", ".js"]
};

let serverRules = [{
    test: /\.tsx?$/,
    use: [{
        loader: 'ts-loader',
        options: {
            getCustomTransformers: () => ({ before: [tsNameof] }),
            compilerOptions: {
                "outDir": path.join(outputDirectory, 'server'),
            }
        }
    }]
},
];

let clientRules = [{
    test: /\.tsx?$/,
    use: [{
        loader: 'ts-loader',
        options: {
            getCustomTransformers: () => ({ before: [tsNameof] }),
            compilerOptions: {
                "outDir": clientOutputDirectory,
            }
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
            rules: serverRules
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
            path: path.join(outputDirectory, 'server')
        },
        devtool: 'inline-source-map',
        module: {
            rules: serverRules
        },
        resolve
    }
    // {
    //     mode,
    //     entry: clientEntry,
    //     target: "node",
    //     externals: [nodeExternals()],
    //     output: {
    //         filename: clientOutputFilename,
    //         path: clientOutputDirectory
    //     },
    //     devtool: 'inline-source-map',
    //     module: {
    //         rules: clientRules
    //     },
    //     resolve
    // }
]
    .filter(config => process.env.config ? config.output.filename === process.env.config : true);