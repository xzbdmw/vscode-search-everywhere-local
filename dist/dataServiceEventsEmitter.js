"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onDidItemIndexed = exports.onDidItemIndexedEventEmitter = void 0;
const vscode = require("vscode");
exports.onDidItemIndexedEventEmitter = new vscode.EventEmitter();
exports.onDidItemIndexed = exports.onDidItemIndexedEventEmitter.event;
//# sourceMappingURL=dataServiceEventsEmitter.js.map