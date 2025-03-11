const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const common = {
    entry: "./src/app.tsx",
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist"),
        clean: true,
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx", ".scss"],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: "ts-loader",
            },
            {
                test: /\.scss$/,
                use: [
                    process.env.NODE_ENV === "production"
                        ? MiniCssExtractPlugin.loader
                        : "style-loader",
                    "css-loader",
                    {
                        loader: "sass-loader",
                        options: {
                            implementation: require("sass"),
                        },
                    },
                ],
            },
            {
                test: /\.(png|jpe?g|webp|gif|svg)$/i,
                type: "asset",
                parser: {
                    dataUrlCondition: {
                        maxSize: 8 * 1024, // Inline images < 8kb
                    },
                },
            }

        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/index.html",
            inject: "body",
        }),
        new MiniCssExtractPlugin({
            filename: "styles.css",
        }),
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, "dist"),
        },
        hot: true,
        port: 3000,
        open: true,
    },
};

const dev = {
    ...common,
    mode: "development",
    name: "dev",
    devtool: "eval-source-map", // Faster rebuilds
};

const prod = {
    ...common,
    mode: "production",
    name: "prod",
    devtool: "source-map", // Better debugging for minified code
};

module.exports = [dev, prod];