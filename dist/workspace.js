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
exports.workspace = void 0;
const vscode = require("vscode");
const actionProcessorEventsEmitter_1 = require("./actionProcessorEventsEmitter");
const cache_1 = require("./cache");
const config_1 = require("./config");
const dataConverter_1 = require("./dataConverter");
const dataService_1 = require("./dataService");
const types_1 = require("./types");
const utils_1 = require("./utils");
const workspaceCommon_1 = require("./workspaceCommon");
const workspaceEventsEmitter_1 = require("./workspaceEventsEmitter");
const workspaceRemover_1 = require("./workspaceRemover");
const workspaceUpdater_1 = require("./workspaceUpdater");
const debounce = require("debounce");
function reloadComponents() {
    dataConverter_1.dataConverter.reload();
    dataService_1.dataService.reload();
}
function handleDidChangeConfiguration(event) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, cache_1.clearConfig)();
        if (exports.workspace.shouldReindexOnConfigurationChange(event)) {
            reloadComponents();
            workspaceEventsEmitter_1.onWillReindexOnConfigurationChangeEventEmitter.fire();
            yield exports.workspace.index(types_1.ActionTrigger.ConfigurationChange);
        }
        else if (utils_1.utils.isDebounceConfigurationToggled(event)) {
            workspaceEventsEmitter_1.onDidDebounceConfigToggleEventEmitter.fire();
        }
        else if (utils_1.utils.isSortingConfigurationToggled(event)) {
            workspaceEventsEmitter_1.onDidSortingConfigToggleEventEmitter.fire();
        }
    });
}
function handleDidChangeWorkspaceFolders(event) {
    return __awaiter(this, void 0, void 0, function* () {
        utils_1.utils.hasWorkspaceChanged(event) &&
            (yield exports.workspace.index(types_1.ActionTrigger.WorkspaceFoldersChange));
    });
}
function handleDidChangeTextDocument(event) {
    return __awaiter(this, void 0, void 0, function* () {
        const uri = event.document.uri;
        const isUriExistingInWorkspace = yield dataService_1.dataService.isUriExistingInWorkspace(uri);
        const hasContentChanged = event.contentChanges.length;
        const actionType = types_1.DetailedActionType.TextChange;
        if (isUriExistingInWorkspace && hasContentChanged) {
            exports.workspace.addNotSavedUri(uri);
            yield workspaceCommon_1.workspaceCommon.registerAction(types_1.ActionType.Remove, workspaceRemover_1.removeFromCacheByPath.bind(null, uri, actionType), types_1.ActionTrigger.DidChangeTextDocument, uri);
            yield workspaceCommon_1.workspaceCommon.registerAction(types_1.ActionType.Update, workspaceUpdater_1.updateCacheByPath.bind(null, uri, actionType), types_1.ActionTrigger.DidChangeTextDocument, uri);
        }
    });
}
function handleDidRenameFiles(event) {
    return __awaiter(this, void 0, void 0, function* () {
        const firstFile = event.files[0];
        const actionType = utils_1.utils.isDirectory(firstFile.oldUri)
            ? types_1.DetailedActionType.RenameOrMoveDirectory
            : types_1.DetailedActionType.RenameOrMoveFile;
        for (let i = 0; i < event.files.length; i++) {
            const file = event.files[i];
            yield workspaceCommon_1.workspaceCommon.registerAction(types_1.ActionType.Update, workspaceUpdater_1.updateCacheByPath.bind(null, file.newUri, actionType, file.oldUri), types_1.ActionTrigger.DidRenameFiles, file.newUri);
            actionType === types_1.DetailedActionType.RenameOrMoveFile &&
                (yield workspaceCommon_1.workspaceCommon.registerAction(types_1.ActionType.Remove, workspaceRemover_1.removeFromCacheByPath.bind(null, file.oldUri, actionType), types_1.ActionTrigger.DidRenameFiles, file.oldUri));
        }
    });
}
function handleDidCreateFiles(event) {
    return __awaiter(this, void 0, void 0, function* () {
        const uri = event.files[0];
        const actionType = utils_1.utils.isDirectory(uri)
            ? types_1.DetailedActionType.CreateNewDirectory
            : types_1.DetailedActionType.CreateNewFile;
        exports.workspace.addNotSavedUri(uri);
        yield workspaceCommon_1.workspaceCommon.registerAction(types_1.ActionType.Update, workspaceUpdater_1.updateCacheByPath.bind(null, uri, actionType), types_1.ActionTrigger.DidCreateFiles, uri);
    });
}
function handleDidDeleteFiles(event) {
    return __awaiter(this, void 0, void 0, function* () {
        const uri = event.files[0];
        const actionType = utils_1.utils.isDirectory(uri)
            ? types_1.DetailedActionType.RemoveDirectory
            : types_1.DetailedActionType.RemoveFile;
        yield workspaceCommon_1.workspaceCommon.registerAction(types_1.ActionType.Remove, workspaceRemover_1.removeFromCacheByPath.bind(null, uri, actionType), types_1.ActionTrigger.DidDeleteFiles, uri);
    });
}
function handleDidSaveTextDocument(textDocument) {
    exports.workspace.removeFromNotSavedUri(textDocument.uri);
}
function handleWillActionProcessorProcessing() {
    workspaceEventsEmitter_1.onWillProcessingEventEmitter.fire();
}
function handleDidActionProcessorProcessing() {
    workspaceEventsEmitter_1.onDidProcessingEventEmitter.fire();
}
function handleWillActionProcessorExecuteAction(action) {
    workspaceEventsEmitter_1.onWillExecuteActionEventEmitter.fire(action);
}
function shouldReindexOnConfigurationChange(event) {
    const excludeMode = (0, config_1.fetchExcludeMode)();
    const excluded = [
        "shouldDisplayNotificationInStatusBar",
        "shouldInitOnStartup",
        "shouldHighlightSymbol",
        "shouldUseDebounce",
        "shouldItemsBeSorted",
        "shouldWorkspaceDataBeCached",
        "shouldSearchSelection",
    ].map((config) => `${defaultSection}.${config}`);
    return ((event.affectsConfiguration("searchEverywhere") &&
        !excluded.some((config) => event.affectsConfiguration(config))) ||
        (excludeMode === types_1.ExcludeMode.FilesAndSearch &&
            (event.affectsConfiguration("files.exclude") ||
                event.affectsConfiguration("search.exclude"))));
}
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        utils_1.utils.setWorkspaceFoldersCommonPath();
        yield dataService_1.dataService.fetchConfig();
        dataConverter_1.dataConverter.fetchConfig();
        exports.workspace.registerEventListeners();
    });
}
function index(indexActionType) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, cache_1.clear)();
        yield workspaceCommon_1.workspaceCommon.index(indexActionType);
    });
}
function removeDataForUnsavedUris() {
    return __awaiter(this, void 0, void 0, function* () {
        const paths = Array.from(exports.workspace.getNotSavedUris());
        for (let i = 0; i < paths.length; i++) {
            const path = paths[i];
            const uri = vscode.Uri.file(path);
            yield workspaceCommon_1.workspaceCommon.registerAction(types_1.ActionType.Remove, workspaceRemover_1.removeFromCacheByPath.bind(null, uri, types_1.DetailedActionType.ReloadUnsavedUri), types_1.ActionTrigger.ReloadUnsavedUri, uri);
            yield workspaceCommon_1.workspaceCommon.registerAction(types_1.ActionType.Update, workspaceUpdater_1.updateCacheByPath.bind(null, uri, types_1.DetailedActionType.ReloadUnsavedUri), types_1.ActionTrigger.ReloadUnsavedUri, uri);
        }
        exports.workspace.clearNotSavedUris();
    });
}
function registerEventListeners() {
    vscode.workspace.onDidChangeConfiguration(debounce(handleDidChangeConfiguration, 250));
    vscode.workspace.onDidChangeWorkspaceFolders(debounce(handleDidChangeWorkspaceFolders, 250));
    vscode.workspace.onDidChangeTextDocument(debounce(handleDidChangeTextDocument, 700));
    vscode.workspace.onDidRenameFiles(handleDidRenameFiles);
    vscode.workspace.onDidCreateFiles(handleDidCreateFiles);
    vscode.workspace.onDidDeleteFiles(handleDidDeleteFiles);
    vscode.workspace.onDidSaveTextDocument(handleDidSaveTextDocument);
    (0, actionProcessorEventsEmitter_1.onDidProcessing)(handleDidActionProcessorProcessing);
    (0, actionProcessorEventsEmitter_1.onWillProcessing)(handleWillActionProcessorProcessing);
    (0, actionProcessorEventsEmitter_1.onWillExecuteAction)(handleWillActionProcessorExecuteAction);
}
function getData() {
    return workspaceCommon_1.workspaceCommon.getData();
}
function addNotSavedUri(uri) {
    const notSavedUris = exports.workspace.getNotSavedUris();
    notSavedUris.add(uri.path);
    (0, cache_1.updateNotSavedUriPaths)(Array.from(notSavedUris));
}
function removeFromNotSavedUri(uri) {
    const notSavedUris = exports.workspace.getNotSavedUris();
    notSavedUris.delete(uri.path);
    (0, cache_1.updateNotSavedUriPaths)(Array.from(notSavedUris));
}
function getNotSavedUris() {
    const array = (0, cache_1.getNotSavedUriPaths)();
    return new Set(array);
}
function clearNotSavedUris() {
    (0, cache_1.clearNotSavedUriPaths)();
}
const defaultSection = "searchEverywhere";
exports.workspace = {
    init,
    index,
    registerEventListeners,
    getData,
    getNotSavedUris,
    addNotSavedUri,
    removeFromNotSavedUri,
    clearNotSavedUris,
    removeDataForUnsavedUris,
    shouldReindexOnConfigurationChange,
    handleDidChangeConfiguration,
    handleDidChangeWorkspaceFolders,
    handleDidChangeTextDocument,
    handleDidSaveTextDocument,
    handleDidRenameFiles,
    handleDidCreateFiles,
    handleDidDeleteFiles,
    handleWillActionProcessorProcessing,
    handleDidActionProcessorProcessing,
    handleWillActionProcessorExecuteAction,
};
//# sourceMappingURL=workspace.js.map