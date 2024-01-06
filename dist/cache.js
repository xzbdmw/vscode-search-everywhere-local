"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearNotSavedUriPaths = exports.clearConfig = exports.clear = exports.updateConfigByKey = exports.getConfigByKey = exports.updateNotSavedUriPaths = exports.getNotSavedUriPaths = exports.updateData = exports.getData = exports.initCache = void 0;
const appConfig_1 = require("./appConfig");
let extensionContext;
function initCache(context) {
    extensionContext = context;
}
exports.initCache = initCache;
function getData() {
    const data = extensionContext.workspaceState.get(appConfig_1.appConfig.dataCacheKey);
    return data && data.length ? data : [];
}
exports.getData = getData;
function updateData(data) {
    extensionContext.workspaceState.update(appConfig_1.appConfig.dataCacheKey, data);
}
exports.updateData = updateData;
function getNotSavedUriPaths() {
    const paths = extensionContext.workspaceState.get(appConfig_1.appConfig.notSaveUriPathsKey);
    return paths || [];
}
exports.getNotSavedUriPaths = getNotSavedUriPaths;
function updateNotSavedUriPaths(paths) {
    extensionContext.workspaceState.update(appConfig_1.appConfig.notSaveUriPathsKey, paths);
}
exports.updateNotSavedUriPaths = updateNotSavedUriPaths;
function getConfigByKey(key) {
    const cache = extensionContext.workspaceState.get(appConfig_1.appConfig.configCacheKey);
    return cache ? cache[key] : undefined;
}
exports.getConfigByKey = getConfigByKey;
function updateConfigByKey(key, value) {
    let cache = extensionContext.workspaceState.get(appConfig_1.appConfig.configCacheKey) || {};
    cache[key] = value;
    extensionContext.workspaceState.update(appConfig_1.appConfig.configCacheKey, cache);
}
exports.updateConfigByKey = updateConfigByKey;
function clear() {
    clearData();
    clearConfig();
}
exports.clear = clear;
function clearConfig() {
    extensionContext.workspaceState.update(appConfig_1.appConfig.configCacheKey, {});
}
exports.clearConfig = clearConfig;
function clearData() {
    extensionContext.workspaceState.update(appConfig_1.appConfig.dataCacheKey, []);
}
function clearNotSavedUriPaths() {
    extensionContext.workspaceState.update(appConfig_1.appConfig.notSaveUriPathsKey, []);
}
exports.clearNotSavedUriPaths = clearNotSavedUriPaths;
//# sourceMappingURL=cache.js.map