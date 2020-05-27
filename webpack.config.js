const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'production',
    target: 'web',
    entry: [
        './src/main/js/index.js'
    ],
    cache: true,
    output: {
        path: __dirname,
        publicPath: "./",
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
                        plugins: ['@babel/plugin-proposal-class-properties', '@babel/plugin-proposal-object-rest-spread']
                    }
                }]
            },
            {
                test: /\.css$/i,
                // style-loader to load CSS into DOM
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: ['url-loader']
            }

        ]
    }
};