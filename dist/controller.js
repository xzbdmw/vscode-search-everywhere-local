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
exports.controller = void 0;
const vscode = require("vscode");
const cache_1 = require("./cache");
const config_1 = require("./config");
const logger_1 = require("./logger");
const quickPick_1 = require("./quickPick");
const types_1 = require("./types");
const utils_1 = require("./utils");
const workspace_1 = require("./workspace");
const workspaceEventsEmitter_1 = require("./workspaceEventsEmitter");
function loadItemsAndShowQuickPick() {
    quickPick_1.quickPick.loadItems();
    quickPick_1.quickPick.show();
    const activeEditorOrUndefined = vscode.window.activeTextEditor;
    if (exports.controller.shouldSearchSelection(activeEditorOrUndefined)) {
        const activeEditor = activeEditorOrUndefined;
        const { start, end } = activeEditor.selection;
        quickPick_1.quickPick.setText(activeEditor.document.getText(new vscode.Range(start, end)));
    }
}
function setQuickPickData() {
    const data = workspace_1.workspace.getData();
    quickPick_1.quickPick.setItems(data);
}
function setBusy(isBusy) {
    if (quickPick_1.quickPick.isInitialized()) {
        setQuickPickLoading(isBusy);
        setQuickPickPlaceholder(isBusy);
    }
}
function setQuickPickLoading(isBusy) {
    quickPick_1.quickPick.showLoading(isBusy);
}
function setQuickPickPlaceholder(isBusy) {
    quickPick_1.quickPick.setPlaceholder(isBusy);
}
function isDataEmpty() {
    const data = workspace_1.workspace.getData();
    return !data.length;
}
function shouldIndexOnQuickPickOpen() {
    return (exports.controller.isInitOnStartupDisabledAndWorkspaceCachingDisabled() ||
        exports.controller.isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty());
}
function isInitOnStartupDisabledAndWorkspaceCachingDisabled() {
    return (!(0, config_1.fetchShouldInitOnStartup)() &&
        !quickPick_1.quickPick.isInitialized() &&
        !(0, config_1.fetchShouldWorkspaceDataBeCached)());
}
function isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty() {
    return (!(0, config_1.fetchShouldInitOnStartup)() &&
        !quickPick_1.quickPick.isInitialized() &&
        (0, config_1.fetchShouldWorkspaceDataBeCached)() &&
        isDataEmpty());
}
function shouldIndexOnStartup() {
    return (exports.controller.isInitOnStartupEnabledAndWorkspaceCachingDisabled() ||
        exports.controller.isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty());
}
function isInitOnStartupEnabledAndWorkspaceCachingDisabled() {
    return ((0, config_1.fetchShouldInitOnStartup)() &&
        !quickPick_1.quickPick.isInitialized() &&
        !(0, config_1.fetchShouldWorkspaceDataBeCached)());
}
function isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty() {
    return ((0, config_1.fetchShouldInitOnStartup)() &&
        !quickPick_1.quickPick.isInitialized() &&
        (0, config_1.fetchShouldWorkspaceDataBeCached)() &&
        isDataEmpty());
}
function shouldLoadDataFromCacheOnQuickPickOpen() {
    return (!(0, config_1.fetchShouldInitOnStartup)() &&
        !quickPick_1.quickPick.isInitialized() &&
        (0, config_1.fetchShouldWorkspaceDataBeCached)());
}
function shouldLoadDataFromCacheOnStartup() {
    return ((0, config_1.fetchShouldInitOnStartup)() &&
        !quickPick_1.quickPick.isInitialized() &&
        (0, config_1.fetchShouldWorkspaceDataBeCached)());
}
function shouldSearchSelection(editor) {
    return quickPick_1.quickPick.isInitialized() && (0, config_1.fetchShouldSearchSelection)() && !!editor;
}
function handleWillProcessing() {
    exports.controller.setBusy(true);
    !quickPick_1.quickPick.isInitialized() && quickPick_1.quickPick.init();
}
function handleDidProcessing() {
    exports.controller.setQuickPickData();
    quickPick_1.quickPick.loadItems();
    exports.controller.setBusy(false);
}
function handleWillExecuteAction(action) {
    if (action.type === types_1.ActionType.Rebuild) {
        quickPick_1.quickPick.setItems([]);
        quickPick_1.quickPick.loadItems();
    }
    logger_1.logger.logAction(action);
}
function handleDidDebounceConfigToggle() {
    exports.controller.setBusy(true);
    quickPick_1.quickPick.reloadOnDidChangeValueEventListener();
    exports.controller.setBusy(false);
}
function handleDidSortingConfigToggle() {
    exports.controller.setBusy(true);
    quickPick_1.quickPick.reloadSortingSettings();
    exports.controller.setBusy(false);
}
function handleWillReindexOnConfigurationChange() {
    quickPick_1.quickPick.reload();
}
function search() {
    return __awaiter(this, void 0, void 0, function* () {
        if (exports.controller.shouldIndexOnQuickPickOpen()) {
            (0, cache_1.clear)();
            yield workspace_1.workspace.index(types_1.ActionTrigger.Search);
        }
        if (exports.controller.shouldLoadDataFromCacheOnQuickPickOpen()) {
            (0, cache_1.clearConfig)();
            !quickPick_1.quickPick.isInitialized() && quickPick_1.quickPick.init();
            yield workspace_1.workspace.removeDataForUnsavedUris();
            exports.controller.setQuickPickData();
        }
        const activeEditorOrUndefined = vscode.window.activeTextEditor;
        if (exports.controller.shouldSearchSelection(activeEditorOrUndefined)) {
            const timeInMsToAvoidListFlashing = 380;
            const activeEditor = activeEditorOrUndefined;
            quickPick_1.quickPick.disposeOnDidChangeValueEventListeners();
            const { start, end } = activeEditor.selection;
            quickPick_1.quickPick.setText(activeEditor.document.getText(new vscode.Range(start, end)));
            yield utils_1.utils.sleepAndExecute(timeInMsToAvoidListFlashing, quickPick_1.quickPick.reloadOnDidChangeValueEventListener);
            // setTimeout(() => {
            //   quickPick.reloadOnDidChangeValueEventListener();
            // }, timeInMsToAvoidListFlashing);
        }
        quickPick_1.quickPick.isInitialized() && loadItemsAndShowQuickPick();
    });
}
function reload() {
    return __awaiter(this, void 0, void 0, function* () {
        (0, cache_1.clear)();
        (0, cache_1.clearNotSavedUriPaths)();
        utils_1.utils.hasWorkspaceAnyFolder()
            ? yield workspace_1.workspace.index(types_1.ActionTrigger.Reload)
            : utils_1.utils.printNoFolderOpenedMessage();
    });
}
function startup() {
    return __awaiter(this, void 0, void 0, function* () {
        if (exports.controller.shouldIndexOnStartup()) {
            yield workspace_1.workspace.index(types_1.ActionTrigger.Startup);
        }
        if (exports.controller.shouldLoadDataFromCacheOnStartup()) {
            (0, cache_1.clearConfig)();
            !quickPick_1.quickPick.isInitialized() && quickPick_1.quickPick.init();
            yield workspace_1.workspace.removeDataForUnsavedUris();
            exports.controller.setQuickPickData();
        }
    });
}
let extensionContext;
function getExtensionContext() {
    return extensionContext;
}
function setExtensionContext(newExtensionContext) {
    extensionContext = newExtensionContext;
}
function registerWorkspaceEventListeners() {
    (0, workspaceEventsEmitter_1.onWillProcessing)(handleWillProcessing);
    (0, workspaceEventsEmitter_1.onDidProcessing)(handleDidProcessing);
    (0, workspaceEventsEmitter_1.onWillExecuteAction)(handleWillExecuteAction);
    (0, workspaceEventsEmitter_1.onDidDebounceConfigToggle)(handleDidDebounceConfigToggle);
    (0, workspaceEventsEmitter_1.onDidSortingConfigToggle)(handleDidSortingConfigToggle);
    (0, workspaceEventsEmitter_1.onWillReindexOnConfigurationChange)(handleWillReindexOnConfigurationChange);
}
function init(newExtensionContext) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.init();
        setExtensionContext(newExtensionContext);
        (0, cache_1.initCache)(exports.controller.getExtensionContext());
        yield workspace_1.workspace.init();
        registerWorkspaceEventListeners();
        logger_1.logger.log(`Extension "vscode-search-everywhere" has been activated.`);
    });
}
exports.controller = {
    shouldIndexOnQuickPickOpen,
    shouldLoadDataFromCacheOnQuickPickOpen,
    shouldIndexOnStartup,
    shouldLoadDataFromCacheOnStartup,
    shouldSearchSelection,
    isInitOnStartupEnabledAndWorkspaceCachingEnabledButDataIsEmpty,
    isInitOnStartupDisabledAndWorkspaceCachingEnabledButDataIsEmpty,
    isInitOnStartupEnabledAndWorkspaceCachingDisabled,
    isInitOnStartupDisabledAndWorkspaceCachingDisabled,
    setQuickPickData,
    setBusy,
    getExtensionContext,
    init,
    search,
    startup,
    reload,
    handleWillProcessing,
    handleDidProcessing,
    handleWillExecuteAction,
    handleDidDebounceConfigToggle,
    handleDidSortingConfigToggle,
    handleWillReindexOnConfigurationChange,
};
//# sourceMappingURL=controller.js.map