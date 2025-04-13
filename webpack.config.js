const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const isProd = process.env.NODE_ENV === "production";

module.exports = {
    mode: isProd ? "production" : "development",
    entry: "./src/main.tsx",
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist"),
        clean: true,
        publicPath: "/"
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"],
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
    },
    module: {
        rules: [
            {
                test: /\.(glb|gltf)$/,
                type: "asset/resource",
            },
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: "ts-loader",
            },
            {
                test: /\.css$/, // ✅ Use only CSS now
                use: [isProd ? MiniCssExtractPlugin.loader : "style-loader", "css-loader"],
            },
            {
                test: /\.(png|jpe?g|webp|gif|svg)$/i,
                type: "asset",
                parser: {
                    dataUrlCondition: {
                        maxSize: 8 * 1024, // Inline images < 8kb
                    },
                },
            },
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
    devtool: isProd ? "source-map" : "eval-source-map",
    devServer: {
        static: path.join(__dirname, "dist"),
        hot: true,
        port: 3001,
        open: true,
    },
};
