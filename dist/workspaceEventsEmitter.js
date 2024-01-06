"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onDidSortingConfigToggle = exports.onWillReindexOnConfigurationChange = exports.onDidDebounceConfigToggle = exports.onWillExecuteAction = exports.onDidProcessing = exports.onWillProcessing = exports.onDidSortingConfigToggleEventEmitter = exports.onWillReindexOnConfigurationChangeEventEmitter = exports.onDidDebounceConfigToggleEventEmitter = exports.onWillExecuteActionEventEmitter = exports.onDidProcessingEventEmitter = exports.onWillProcessingEventEmitter = void 0;
const vscode = require("vscode");
exports.onWillProcessingEventEmitter = new vscode.EventEmitter();
exports.onDidProcessingEventEmitter = new vscode.EventEmitter();
exports.onWillExecuteActionEventEmitter = new vscode.EventEmitter();
exports.onDidDebounceConfigToggleEventEmitter = new vscode.EventEmitter();
exports.onWillReindexOnConfigurationChangeEventEmitter = new vscode.EventEmitter();
exports.onDidSortingConfigToggleEventEmitter = new vscode.EventEmitter();
exports.onWillProcessing = exports.onWillProcessingEventEmitter.event;
exports.onDidProcessing = exports.onDidProcessingEventEmitter.event;
exports.onWillExecuteAction = exports.onWillExecuteActionEventEmitter.event;
exports.onDidDebounceConfigToggle = exports.onDidDebounceConfigToggleEventEmitter.event;
exports.onWillReindexOnConfigurationChange = exports.onWillReindexOnConfigurationChangeEventEmitter.event;
exports.onDidSortingConfigToggle = exports.onDidSortingConfigToggleEventEmitter.event;
//# sourceMappingURL=workspaceEventsEmitter.js.map