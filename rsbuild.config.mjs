import { defineConfig } from '@rsbuild/core';

export default defineConfig({
    context: __dirname,
    // html: {
    //     template: './public/index.html',
    // },
    html: {
        // template: ['./public/index.html', './public/config.html'],
        template({ entryName }) {
            const templates = {
                index: './src/pages/index.html',
                config: './src/pages/config.html',
            };
            return templates[entryName] || './src/pages/index.html';
        }
    },
    source: {
        entry: {
            index: {
                import: './src/index.js',
                // html: false
            },
            config: {
                import: './src/config.js',
                // html: false
            },
        }
    },
    output: {
        path: './dist',
        filename: '[name].[hash].js',
        chunkFilename: '[name].[hash].js',
    },
    assets: {
        // 静态资源目录
        path: './public',
        // 静态资源输出目录
        output: './dist',
        // 静态资源URL前缀
        publicPath: '/',
    },
    dev: {
        // 开发模式下将编译后的文件输出到磁盘
        writeToDisk: true,
    },
});
