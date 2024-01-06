"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFromCacheByPath = void 0;
const cache_1 = require("./cache");
const types_1 = require("./types");
const workspaceCommon_1 = require("./workspaceCommon");
function removeUri(data, uri) {
    return data.filter((qpItem) => qpItem.uri.path !== uri.path);
}
function removeFolder(data, uri) {
    return data.filter((qpItem) => {
        return !qpItem.uri.path.includes(uri.path);
    });
}
function removeFromCacheByPath(uri, detailedActionType) {
    let data = workspaceCommon_1.workspaceCommon.getData();
    const removeFnByDetailedActionType = {
        [types_1.DetailedActionType.RenameOrMoveFile]: removeUri.bind(null, data, uri),
        [types_1.DetailedActionType.RemoveFile]: removeUri.bind(null, data, uri),
        [types_1.DetailedActionType.TextChange]: removeUri.bind(null, data, uri),
        [types_1.DetailedActionType.ReloadUnsavedUri]: removeUri.bind(null, data, uri),
        [types_1.DetailedActionType.RemoveDirectory]: removeFolder.bind(null, data, uri),
        [types_1.DetailedActionType.RenameOrMoveDirectory]: removeFolder.bind(null, data, uri),
    };
    data = removeFnByDetailedActionType[detailedActionType]();
    (0, cache_1.updateData)(data);
}
exports.removeFromCacheByPath = removeFromCacheByPath;
//# sourceMappingURL=workspaceRemover.js.map