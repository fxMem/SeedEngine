const path = require('path');

module.exports = {
	mode: 'development',
    entry: path.join(__dirname, '/src/app.ts'),
    output: {
        filename: 'app.js',
        path: path.join(__dirname, '/distr')
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
        ]
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
};