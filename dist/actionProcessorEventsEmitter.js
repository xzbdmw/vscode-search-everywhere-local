"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onWillExecuteAction = exports.onWillProcessing = exports.onDidProcessing = exports.onWillExecuteActionEventEmitter = exports.onWillProcessingEventEmitter = exports.onDidProcessingEventEmitter = void 0;
const vscode = require("vscode");
exports.onDidProcessingEventEmitter = new vscode.EventEmitter();
exports.onWillProcessingEventEmitter = new vscode.EventEmitter();
exports.onWillExecuteActionEventEmitter = new vscode.EventEmitter();
exports.onDidProcessing = exports.onDidProcessingEventEmitter.event;
exports.onWillProcessing = exports.onWillProcessingEventEmitter.event;
exports.onWillExecuteAction = exports.onWillExecuteActionEventEmitter.event;
//# sourceMappingURL=actionProcessorEventsEmitter.js.map