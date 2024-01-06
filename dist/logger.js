"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const vscode = require("vscode");
const utils_1 = require("./utils");
function init() {
    const channel = vscode.window.createOutputChannel("Search everywhere");
    setChannel(channel);
}
function log(message) {
    const timestamp = exports.logger.getTimestamp();
    const channel = exports.logger.getChannel();
    channel.appendLine(`[${timestamp}] ${message}`);
}
function logAction(action) {
    const message = `Execute action - type: ${action.type} | fn: ${action.fn.name} | trigger: ${action.trigger} ${action.uri ? `| uri: ${action.uri}` : ""}`;
    exports.logger.log(message);
}
function logScanTime(indexStats) {
    const message = `Workspace scan completed - elapsed time: ${indexStats.ElapsedTimeInSeconds}s | scanned files: ${indexStats.ScannedUrisCount} | indexed items: ${indexStats.IndexedItemsCount}`;
    exports.logger.log(message);
}
function logStructure(data) {
    const message = `Scanned files:
  ${utils_1.utils.getStructure(data)}`;
    exports.logger.log(message);
}
function getTimestamp() {
    const date = new Date();
    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
}
let channel;
function setChannel(newChannel) {
    channel = newChannel;
}
function getChannel() {
    return channel;
}
exports.logger = {
    getTimestamp,
    getChannel,
    init,
    log,
    logAction,
    logScanTime,
    logStructure,
};
//# sourceMappingURL=logger.js.map