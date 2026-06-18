// vite.config.ts
import { defineConfig } from "file:///D:/workspace/G6-React/x6-editor/node_modules/vite/dist/node/index.js";
import react from "file:///D:/workspace/G6-React/x6-editor/node_modules/@vitejs/plugin-react/dist/index.js";
import dts from "file:///D:/workspace/G6-React/x6-editor/node_modules/vite-plugin-dts/dist/index.mjs";
import { resolve } from "path";
var __vite_injected_original_dirname = "D:\\workspace\\G6-React\\x6-editor";
var vite_config_default = defineConfig(({ mode }) => {
  if (mode === "lib") {
    return {
      plugins: [
        react(),
        dts({
          insertTypesEntry: true,
          outDir: "dist",
          include: ["lib/**/*"]
        })
      ],
      build: {
        lib: {
          entry: resolve(__vite_injected_original_dirname, "lib/index.ts"),
          name: "G6ReactCharts",
          formats: ["es", "umd"],
          fileName: (format) => `index.${format}.js`
        },
        rollupOptions: {
          external: ["react", "react-dom"],
          output: {
            globals: {
              react: "React",
              "react-dom": "ReactDOM"
            }
          }
        },
        outDir: "dist"
      }
    };
  }
  return {
    plugins: [react()],
    server: {
      port: 3004,
      open: true
    },
    root: ".",
    publicDir: "public",
    build: {
      rollupOptions: {
        input: {
          main: resolve(__vite_injected_original_dirname, "src/index.html"),
          editor: resolve(__vite_injected_original_dirname, "example/index.html"),
          "json-formatter": resolve(__vite_injected_original_dirname, "../json-formatter/index.html"),
          "url-parser": resolve(__vite_injected_original_dirname, "../url-parser/index.html"),
          "api-tester": resolve(__vite_injected_original_dirname, "../api-tester/frontend/index.html")
        }
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFx3b3Jrc3BhY2VcXFxcRzYtUmVhY3RcXFxceDYtZWRpdG9yXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFx3b3Jrc3BhY2VcXFxcRzYtUmVhY3RcXFxceDYtZWRpdG9yXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi93b3Jrc3BhY2UvRzYtUmVhY3QveDYtZWRpdG9yL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xyXG5pbXBvcnQgZHRzIGZyb20gJ3ZpdGUtcGx1Z2luLWR0cydcclxuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XHJcbiAgaWYgKG1vZGUgPT09ICdsaWInKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBwbHVnaW5zOiBbXHJcbiAgICAgICAgcmVhY3QoKSxcclxuICAgICAgICBkdHMoe1xyXG4gICAgICAgICAgaW5zZXJ0VHlwZXNFbnRyeTogdHJ1ZSxcclxuICAgICAgICAgIG91dERpcjogJ2Rpc3QnLFxyXG4gICAgICAgICAgaW5jbHVkZTogWydsaWIvKiovKiddLFxyXG4gICAgICAgIH0pLFxyXG4gICAgICBdLFxyXG4gICAgICBidWlsZDoge1xyXG4gICAgICAgIGxpYjoge1xyXG4gICAgICAgICAgZW50cnk6IHJlc29sdmUoX19kaXJuYW1lLCAnbGliL2luZGV4LnRzJyksXHJcbiAgICAgICAgICBuYW1lOiAnRzZSZWFjdENoYXJ0cycsXHJcbiAgICAgICAgICBmb3JtYXRzOiBbJ2VzJywgJ3VtZCddLFxyXG4gICAgICAgICAgZmlsZU5hbWU6IChmb3JtYXQpID0+IGBpbmRleC4ke2Zvcm1hdH0uanNgLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICAgICAgZXh0ZXJuYWw6IFsncmVhY3QnLCAncmVhY3QtZG9tJ10sXHJcbiAgICAgICAgICBvdXRwdXQ6IHtcclxuICAgICAgICAgICAgZ2xvYmFsczoge1xyXG4gICAgICAgICAgICAgIHJlYWN0OiAnUmVhY3QnLFxyXG4gICAgICAgICAgICAgICdyZWFjdC1kb20nOiAnUmVhY3RET00nLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIG91dERpcjogJ2Rpc3QnLFxyXG4gICAgICB9LFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIHBsdWdpbnM6IFtyZWFjdCgpXSxcclxuICAgIHNlcnZlcjoge1xyXG4gICAgICBwb3J0OiAzMDA0LFxyXG4gICAgICBvcGVuOiB0cnVlLFxyXG4gICAgfSxcclxuICAgIHJvb3Q6ICcuJyxcclxuICAgIHB1YmxpY0RpcjogJ3B1YmxpYycsXHJcbiAgICBidWlsZDoge1xyXG4gICAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgICAgaW5wdXQ6IHtcclxuICAgICAgICAgIG1haW46IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2luZGV4Lmh0bWwnKSxcclxuICAgICAgICAgIGVkaXRvcjogcmVzb2x2ZShfX2Rpcm5hbWUsICdleGFtcGxlL2luZGV4Lmh0bWwnKSxcclxuICAgICAgICAgICdqc29uLWZvcm1hdHRlcic6IHJlc29sdmUoX19kaXJuYW1lLCAnLi4vanNvbi1mb3JtYXR0ZXIvaW5kZXguaHRtbCcpLFxyXG4gICAgICAgICAgJ3VybC1wYXJzZXInOiByZXNvbHZlKF9fZGlybmFtZSwgJy4uL3VybC1wYXJzZXIvaW5kZXguaHRtbCcpLFxyXG4gICAgICAgICAgJ2FwaS10ZXN0ZXInOiByZXNvbHZlKF9fZGlybmFtZSwgJy4uL2FwaS10ZXN0ZXIvZnJvbnRlbmQvaW5kZXguaHRtbCcpLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH1cclxufSlcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF1UixTQUFTLG9CQUFvQjtBQUNwVCxPQUFPLFdBQVc7QUFDbEIsT0FBTyxTQUFTO0FBQ2hCLFNBQVMsZUFBZTtBQUh4QixJQUFNLG1DQUFtQztBQUt6QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUN4QyxNQUFJLFNBQVMsT0FBTztBQUNsQixXQUFPO0FBQUEsTUFDTCxTQUFTO0FBQUEsUUFDUCxNQUFNO0FBQUEsUUFDTixJQUFJO0FBQUEsVUFDRixrQkFBa0I7QUFBQSxVQUNsQixRQUFRO0FBQUEsVUFDUixTQUFTLENBQUMsVUFBVTtBQUFBLFFBQ3RCLENBQUM7QUFBQSxNQUNIO0FBQUEsTUFDQSxPQUFPO0FBQUEsUUFDTCxLQUFLO0FBQUEsVUFDSCxPQUFPLFFBQVEsa0NBQVcsY0FBYztBQUFBLFVBQ3hDLE1BQU07QUFBQSxVQUNOLFNBQVMsQ0FBQyxNQUFNLEtBQUs7QUFBQSxVQUNyQixVQUFVLENBQUMsV0FBVyxTQUFTLE1BQU07QUFBQSxRQUN2QztBQUFBLFFBQ0EsZUFBZTtBQUFBLFVBQ2IsVUFBVSxDQUFDLFNBQVMsV0FBVztBQUFBLFVBQy9CLFFBQVE7QUFBQSxZQUNOLFNBQVM7QUFBQSxjQUNQLE9BQU87QUFBQSxjQUNQLGFBQWE7QUFBQSxZQUNmO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxRQUNBLFFBQVE7QUFBQSxNQUNWO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFFQSxTQUFPO0FBQUEsSUFDTCxTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsSUFDakIsUUFBUTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLElBQ1I7QUFBQSxJQUNBLE1BQU07QUFBQSxJQUNOLFdBQVc7QUFBQSxJQUNYLE9BQU87QUFBQSxNQUNMLGVBQWU7QUFBQSxRQUNiLE9BQU87QUFBQSxVQUNMLE1BQU0sUUFBUSxrQ0FBVyxnQkFBZ0I7QUFBQSxVQUN6QyxRQUFRLFFBQVEsa0NBQVcsb0JBQW9CO0FBQUEsVUFDL0Msa0JBQWtCLFFBQVEsa0NBQVcsOEJBQThCO0FBQUEsVUFDbkUsY0FBYyxRQUFRLGtDQUFXLDBCQUEwQjtBQUFBLFVBQzNELGNBQWMsUUFBUSxrQ0FBVyxtQ0FBbUM7QUFBQSxRQUN0RTtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
