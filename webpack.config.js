const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    target: 'web',
    entry: [
        './src/main/js/index.js'
    ],
    devtool: 'inline-source-map',
    cache: true,
    devServer: {
        port: 9000,
        watchContentBase: true,
        proxy: {
            '/api': 'http://localhost:8080'
        },
        hot: true
    },
    output: {
        path: __dirname,
        filename: 'target/classes/static/built/bundle.js'
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/main/resources/templates/index.html'
        })
    ],
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules)/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        presets: ["@babel/preset-env", "@babel/preset-react"],
                        plugins: ['@babel/plugin-proposal-class-properties']
                    }
                }]
            },
            {
                test: /\.css$/i,
                // style-loader to load CSS into DOM
                use: ['style-loader', 'css-loader'],
            },
        ]
    }
};