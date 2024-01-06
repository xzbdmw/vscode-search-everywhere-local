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
exports.utils = void 0;
const vscode = require("vscode");
function getWorkspaceFoldersPaths() {
    return ((vscode.workspace.workspaceFolders &&
        vscode.workspace.workspaceFolders.map((wf) => wf.uri.path)) ||
        []);
}
function getCommonSubstringFromStart(strings) {
    const A = strings.concat().sort(), a1 = A[0], a2 = A[A.length - 1], L = a1.length;
    let i = 0;
    while (i < L && a1.charAt(i) === a2.charAt(i)) {
        i++;
    }
    return a1.substring(0, i);
}
function hasWorkspaceAnyFolder() {
    return !!(vscode.workspace.workspaceFolders &&
        vscode.workspace.workspaceFolders.length);
}
function hasWorkspaceMoreThanOneFolder() {
    return !!(vscode.workspace.workspaceFolders &&
        vscode.workspace.workspaceFolders.length > 1);
}
function hasWorkspaceChanged(event) {
    return !!event.added.length || !!event.removed.length;
}
function isDebounceConfigurationToggled(event) {
    return event.affectsConfiguration("searchEverywhere.shouldUseDebounce");
}
function isSortingConfigurationToggled(event) {
    return event.affectsConfiguration("searchEverywhere.shouldItemsBeSorted");
}
function printNoFolderOpenedMessage() {
    vscode.window.showInformationMessage("Workspace doesn't contain any folder opened");
}
function printErrorMessage(error) {
    vscode.window.showInformationMessage(`Something went wrong...
    Extension encountered the following error: ${error.stack}`);
}
function printStatsMessage(indexStats) {
    vscode.window.showInformationMessage(`Elapsed time: ${indexStats.ElapsedTimeInSeconds}s
     Scanned files: ${indexStats.ScannedUrisCount}
     Indexed items: ${indexStats.IndexedItemsCount}`);
}
function createWorkspaceData() {
    return {
        items: new Map(),
        count: 0,
    };
}
function clearWorkspaceData(workspaceData) {
    workspaceData.items.clear();
    workspaceData.count = 0;
}
function getSplitter() {
    return "§&§";
}
function getUrisForDirectoryPathUpdate(data, uri, fileKind) {
    return data
        .filter((qpItem) => qpItem.uri.path.includes(uri.path) && qpItem.symbolKind === fileKind)
        .map((qpItem) => qpItem.uri);
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function sleepAndExecute(ms, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            yield fn();
        }), ms);
    });
}
function countWordInstances(text, word) {
    return text.split(word).length - 1;
}
function getNthIndex(text, word, occurrenceNumber) {
    let index = -1;
    while (occurrenceNumber-- && index++ < text.length) {
        index = text.indexOf(word, index);
        if (index < 0) {
            break;
        }
    }
    return index;
}
function getLastFromArray(array, predicate) {
    return [...array].reverse().find(predicate);
}
function groupBy(array, keyGetter) {
    const map = new Map();
    array.forEach((item) => {
        const key = keyGetter(item);
        const collection = map.get(key);
        !collection ? map.set(key, [item]) : collection.push(item);
    });
    return map;
}
function getNameFromUri(uri) {
    return uri.path.split("/").pop();
}
function updateQpItemsWithNewDirectoryPath(data, oldDirectoryUri, newDirectoryUri) {
    const normalizedOldDirectoryUriPath = exports.utils.normalizeUriPath(oldDirectoryUri.path);
    let normalizedNewDirectoryUriPath = exports.utils.normalizeUriPath(newDirectoryUri.path);
    return data.map((qpItem) => {
        if (qpItem.uri.path.includes(oldDirectoryUri.path)) {
            qpItem.detail = qpItem.detail.replace(normalizedOldDirectoryUriPath, normalizedNewDirectoryUriPath);
            const newUriPath = qpItem.uri.path.replace(normalizedOldDirectoryUriPath, normalizedNewDirectoryUriPath);
            qpItem.uri = vscode.Uri.file(newUriPath);
            qpItem.uri._fsPath = qpItem.uri.path;
        }
        return qpItem;
    });
}
function normalizeUriPath(path) {
    const workspaceFoldersPaths = getWorkspaceFoldersPaths();
    let normalizedPath = path;
    if (exports.utils.hasWorkspaceMoreThanOneFolder()) {
        normalizedPath = normalizedPath.replace(exports.utils.getWorkspaceFoldersCommonPathProp(), "");
    }
    else {
        workspaceFoldersPaths.forEach((wfPath) => {
            normalizedPath = normalizedPath.replace(wfPath, "");
        });
    }
    return normalizedPath;
}
function isDirectory(uri) {
    const name = exports.utils.getNameFromUri(uri);
    return !name.includes(".");
}
function convertMsToSec(timeInMs) {
    return Math.floor((timeInMs % (1000 * 60)) / 1000);
}
function getDataForBuildingStructure(data) {
    const uriWithNoOfItems = Array.from(data.items).map((keyValue) => {
        const [key, value] = keyValue;
        let normalizedPath = exports.utils.normalizeUriPath(key);
        normalizedPath = normalizedPath.replace("/", "");
        const itemsCount = value.elements.length;
        return [normalizedPath, itemsCount];
    });
    return new Map(uriWithNoOfItems);
}
function buildStructure(paths, normalizedData) {
    const structure = {};
    paths.forEach(function (path) {
        const splittedPath = path.split("/");
        splittedPath.reduce((currentStructure, node, index) => {
            let text = {};
            if (index === splittedPath.length - 1) {
                const value = normalizedData.get(path) || 0;
                text = `${value} ${value === 1 ? "item" : "items"}`;
            }
            return currentStructure[node] || (currentStructure[node] = text);
        }, structure);
    });
    return structure;
}
function getStructure(data) {
    const normalizedData = getDataForBuildingStructure(data);
    const paths = Array.from(normalizedData.keys());
    const structure = buildStructure(paths, normalizedData);
    return JSON.stringify(structure, null, 2);
}
function setWorkspaceFoldersCommonPath() {
    if (exports.utils.hasWorkspaceMoreThanOneFolder()) {
        const workspaceFoldersPaths = getWorkspaceFoldersPaths();
        const workspaceFoldersCommonPathTemp = getCommonSubstringFromStart(workspaceFoldersPaths);
        const workspaceFoldersCommonPathArray = workspaceFoldersCommonPathTemp.split("/");
        workspaceFoldersCommonPathArray.pop();
        setWorkspaceFoldersCommonPathProp(workspaceFoldersCommonPathArray.join("/"));
    }
}
let workspaceFoldersCommonPath = "";
function setWorkspaceFoldersCommonPathProp(newWorkspaceFoldersCommonPath) {
    workspaceFoldersCommonPath = newWorkspaceFoldersCommonPath;
}
function getWorkspaceFoldersCommonPathProp() {
    return workspaceFoldersCommonPath;
}
exports.utils = {
    getWorkspaceFoldersCommonPathProp,
    hasWorkspaceAnyFolder,
    hasWorkspaceMoreThanOneFolder,
    hasWorkspaceChanged,
    isDebounceConfigurationToggled,
    isSortingConfigurationToggled,
    printNoFolderOpenedMessage,
    printErrorMessage,
    printStatsMessage,
    createWorkspaceData,
    clearWorkspaceData,
    getSplitter,
    getUrisForDirectoryPathUpdate,
    sleep,
    sleepAndExecute,
    countWordInstances,
    getNthIndex,
    getLastFromArray,
    groupBy,
    getNameFromUri,
    updateQpItemsWithNewDirectoryPath,
    normalizeUriPath,
    isDirectory,
    convertMsToSec,
    getStructure,
    setWorkspaceFoldersCommonPath,
};
//# sourceMappingURL=utils.js.map