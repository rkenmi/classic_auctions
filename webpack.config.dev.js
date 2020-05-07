const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    target: 'web',
    entry: [
        './src/main/js/index.js',
        './src/main/resources/static/main.css',
    ],
    devtool: 'inline-source-map',
    cache: true,
    devServer: {
        port: 9000,
        watchContentBase: true,
        historyApiFallback: true,  // this is for fallback url for React Router
        proxy: {
            '/api': 'http://localhost:8080'
        },
        hot: true
    },
    output: {
        path: __dirname,
        publicPath: "/",
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
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: ['url-loader']
            }

        ]
    }
};