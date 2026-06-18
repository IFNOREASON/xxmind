import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  if (mode === 'lib') {
    return {
      plugins: [
        react(),
        dts({
          insertTypesEntry: true,
          outDir: 'dist',
          include: ['lib/**/*'],
        }),
      ],
      build: {
        lib: {
          entry: resolve(__dirname, 'lib/index.ts'),
          name: 'G6ReactCharts',
          formats: ['es', 'umd'],
          fileName: (format) => `index.${format}.js`,
        },
        rollupOptions: {
          external: ['react', 'react-dom'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
            },
          },
        },
        outDir: 'dist',
      },
    }
  }

  return {
    plugins: [react()],
    server: {
      port: 3004,
      open: true,
    },
    root: '.',
    publicDir: 'public',
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'src/index.html'),
          editor: resolve(__dirname, 'example/index.html'),
          'json-formatter': resolve(__dirname, '../json-formatter/index.html'),
          'url-parser': resolve(__dirname, '../url-parser/index.html'),
          'api-tester': resolve(__dirname, '../api-tester/frontend/index.html'),
        },
      },
    },
  }
})
