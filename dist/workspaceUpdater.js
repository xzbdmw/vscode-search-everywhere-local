"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCacheByPath = void 0;
const cache_1 = require("./cache");
const types_1 = require("./types");
const utils_1 = require("./utils");
const workspaceCommon_1 = require("./workspaceCommon");
function updateUri(uri) {
    return __awaiter(this, void 0, void 0, function* () {
        const dataForUri = yield workspaceCommon_1.workspaceCommon.downloadData([uri]);
        const data = mergeWithDataFromCache(dataForUri);
        (0, cache_1.updateData)(data);
    });
}
function updateFolder(uri, oldUri) {
    const data = workspaceCommon_1.workspaceCommon.getData();
    const updatedData = utils_1.utils.updateQpItemsWithNewDirectoryPath(data, oldUri, uri);
    (0, cache_1.updateData)(updatedData);
}
function mergeWithDataFromCache(data) {
    const dataFromCache = workspaceCommon_1.workspaceCommon.getData();
    return dataFromCache.concat(data);
}
function updateCacheByPath(uri, detailedActionType, oldUri) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const updateFnByDetailedActionType = {
                [types_1.DetailedActionType.CreateNewFile]: updateUri.bind(null, uri),
                [types_1.DetailedActionType.RenameOrMoveFile]: updateUri.bind(null, uri),
                [types_1.DetailedActionType.TextChange]: updateUri.bind(null, uri),
                [types_1.DetailedActionType.ReloadUnsavedUri]: updateUri.bind(null, uri),
                [types_1.DetailedActionType.RenameOrMoveDirectory]: updateFolder.bind(null, uri, oldUri),
            };
            const updateFn = updateFnByDetailedActionType[detailedActionType];
            updateFn && (yield updateFn());
        }
        catch (error) {
            utils_1.utils.printErrorMessage(error);
            yield workspaceCommon_1.workspaceCommon.index("on error catch");
        }
    });
}
exports.updateCacheByPath = updateCacheByPath;
//# sourceMappingURL=workspaceUpdater.js.map