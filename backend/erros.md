[plugin:vite:css] [postcss] It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin. The PostCSS plugin has moved to a separate package, so to continue using Tailwind CSS with PostCSS you'll need to install `@tailwindcss/postcss` and update your PostCSS configuration.
C:/timetriq/frontend/src/index.css:undefined:null
    at mt (C:\timetriq\frontend\node_modules\tailwindcss\dist\lib.js:38:1643)
    at LazyResult.runOnRoot (C:\timetriq\frontend\node_modules\postcss\lib\lazy-result.js:367:16)
    at LazyResult.runAsync (C:\timetriq\frontend\node_modules\postcss\lib\lazy-result.js:296:26)
    at async runPostCSS (file:///C:/timetriq/frontend/node_modules/vite/dist/node/chunks/node.js:22644:19)
    at async compilePostCSS (file:///C:/timetriq/frontend/node_modules/vite/dist/node/chunks/node.js:22628:6)
    at async compileCSS (file:///C:/timetriq/frontend/node_modules/vite/dist/node/chunks/node.js:22558:26)
    at async TransformPluginContext.handler (file:///C:/timetriq/frontend/node_modules/vite/dist/node/chunks/node.js:22055:47)
    at async EnvironmentPluginContainer.transform (file:///C:/timetriq/frontend/node_modules/vite/dist/node/chunks/node.js:30201:14)
    at async loadAndTransform (file:///C:/timetriq/frontend/node_modules/vite/dist/node/chunks/node.js:20124:26)
Click outside, press Esc key, or fix the code to dismiss.