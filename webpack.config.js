const path = require('path');
const tsNameof = require("ts-nameof");
const nodeExternals = require('webpack-node-externals');

module.exports = {
	mode: 'development',
    entry: path.join(__dirname, '/src/app.ts'),
    target: "node",
    externals: [nodeExternals()],
    output: {
        filename: 'app.js',
        path: path.join(__dirname, '/distr')
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [{
                    loader: 'ts-loader', 
                    options: {
                      getCustomTransformers: () => ({ before: [tsNameof] })
                    }
                  }]
            },
        ]
    },
    resolve: {
        extensions: [".ts", ".js"],
        alias: {
            '@core': path.join(__dirname, 'src/core'),
            '@transport': path.join(__dirname, 'src/transport'),
            '@auth': path.join(__dirname, 'src/authentification'),
            '@handshake': path.join(__dirname, 'src/handshake')
        }
    },
};