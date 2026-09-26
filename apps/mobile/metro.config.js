// Learn more: https://docs.expo.dev/guides/customizing-metro/
const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Code shared with the web app lives outside this project, so Metro must watch
// it explicitly. packages/shared must stay dependency-free: any import there
// would resolve against the web app's node_modules (a second React).
config.watchFolders = [
  ...(config.watchFolders ?? []),
  path.resolve(__dirname, "../../packages/shared"),
];

module.exports = config;
