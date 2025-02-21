import { defineConfig, Options } from "tsup";

const baseOptions: Options = {
  clean: true,
  dts: true,
  entry: ["src/index.ts"],
  minify: false,
  skipNodeModulesBundle: true,
  sourcemap: true,
  target: "es2022",
  tsconfig: "tsconfig.json",
  keepNames: true,
  treeshake: true,
};

export default [
  defineConfig({
    ...baseOptions,
    outDir: "dist/cjs",
    format: "cjs",
    outExtension: () => ({ js: ".cjs" }),
  }),
  defineConfig({
    ...baseOptions,
    outDir: "dist/esm",
    format: "esm",
    outExtension: () => ({ js: ".mjs" }),
  }),
];
