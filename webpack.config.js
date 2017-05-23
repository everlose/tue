// webpack.config.js
module.exports = {
    entry: './src/main.js',
    output: {
        filename: './dist/tue.js'
    },
    devtool: 'source-map',
    devServer: {
        contentBase: "./demo/",
        colors: true,
        historyApiFallback: true,
        inline: true,
        port: '8097',
        //自动打开浏览器
        open: {
            type: true
        }
    }
};
