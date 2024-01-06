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
exports.workspaceCommon = void 0;
const perf_hooks_1 = require("perf_hooks");
const vscode = require("vscode");
const actionProcessor_1 = require("./actionProcessor");
const cache_1 = require("./cache");
const config_1 = require("./config");
const dataConverter_1 = require("./dataConverter");
const dataService_1 = require("./dataService");
const dataServiceEventsEmitter_1 = require("./dataServiceEventsEmitter");
const logger_1 = require("./logger");
const types_1 = require("./types");
const utils_1 = require("./utils");
function getData() {
    return (0, cache_1.getData)() || [];
}
function index(trigger) {
    return __awaiter(this, void 0, void 0, function* () {
        yield registerAction(types_1.ActionType.Rebuild, indexWithProgress, trigger);
    });
}
function indexWithProgress() {
    return __awaiter(this, void 0, void 0, function* () {
        utils_1.utils.hasWorkspaceAnyFolder()
            ? yield vscode.window.withProgress({
                location: exports.workspaceCommon.getNotificationLocation(),
                title: exports.workspaceCommon.getNotificationTitle(),
                cancellable: true,
            }, indexWithProgressTask)
            : utils_1.utils.printNoFolderOpenedMessage();
    });
}
function registerAction(type, fn, trigger, uri) {
    return __awaiter(this, void 0, void 0, function* () {
        const action = {
            type,
            fn,
            trigger,
            uri,
        };
        yield actionProcessor_1.actionProcessor.register(action);
    });
}
function downloadData(uris) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield dataService_1.dataService.fetchData(uris);
        return dataConverter_1.dataConverter.convertToQpData(data);
    });
}
function cancelIndexing() {
    dataService_1.dataService.cancel();
    dataConverter_1.dataConverter.cancel();
}
function indexWithProgressTask(progress, token) {
    return __awaiter(this, void 0, void 0, function* () {
        const handleCancellationRequestedSubscription = token.onCancellationRequested(handleCancellationRequested);
        const handleDidItemIndexedSubscription = (0, dataServiceEventsEmitter_1.onDidItemIndexed)(handleDidItemIndexed.bind(null, progress));
        const startMeasure = startTimeMeasurement();
        const data = yield indexWorkspace();
        resetProgress();
        handleCancellationRequestedSubscription.dispose();
        handleDidItemIndexedSubscription.dispose();
        // necessary for proper way to complete progress
        utils_1.utils.sleep(250);
        const elapsedTimeInMs = getTimeElapsed(startMeasure);
        const elapsedTimeInSec = utils_1.utils.convertMsToSec(elapsedTimeInMs);
        printStats(data, elapsedTimeInSec);
    });
}
function startTimeMeasurement() {
    return perf_hooks_1.performance.now();
}
function getTimeElapsed(start) {
    const end = perf_hooks_1.performance.now();
    return end - start;
}
function printStats(data, elapsedTime) {
    const indexStats = {
        ElapsedTimeInSeconds: elapsedTime,
        ScannedUrisCount: data.items.size,
        IndexedItemsCount: data.count,
    };
    utils_1.utils.printStatsMessage(indexStats);
    logger_1.logger.logScanTime(indexStats);
    logger_1.logger.logStructure(data);
}
function indexWorkspace() {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield dataService_1.dataService.fetchData();
        const qpData = dataConverter_1.dataConverter.convertToQpData(data);
        (0, cache_1.updateData)(qpData);
        return data;
    });
}
function resetProgress() {
    setCurrentProgressValue(0);
    setProgressStep(0);
}
function handleCancellationRequested() {
    exports.workspaceCommon.cancelIndexing();
}
function handleDidItemIndexed(progress, urisCount) {
    !isProgressStepCalculated() && calculateProgressStep(urisCount);
    increaseCurrentProgressValue();
    reportCurrentProgress(progress);
}
function isProgressStepCalculated() {
    return !!exports.workspaceCommon.getProgressStep();
}
function calculateProgressStep(urisCount) {
    setProgressStep(100 / urisCount);
}
function increaseCurrentProgressValue() {
    const progressStep = exports.workspaceCommon.getProgressStep();
    const currentProgressValue = exports.workspaceCommon.getCurrentProgressValue();
    setCurrentProgressValue(currentProgressValue + progressStep);
}
function reportCurrentProgress(progress) {
    progress.report({
        increment: exports.workspaceCommon.getProgressStep(),
        message: ` ${`${Math.round(exports.workspaceCommon.getCurrentProgressValue())}%`}`,
    });
}
function getNotificationLocation() {
    return (0, config_1.fetchShouldDisplayNotificationInStatusBar)()
        ? vscode.ProgressLocation.Window
        : vscode.ProgressLocation.Notification;
}
function getNotificationTitle() {
    return (0, config_1.fetchShouldDisplayNotificationInStatusBar)()
        ? "Indexing..."
        : "Indexing workspace files and symbols...";
}
function setProgressStep(newProgressStep) {
    progressStep = newProgressStep;
}
function getProgressStep() {
    return progressStep;
}
function setCurrentProgressValue(newCurrentProgressValue) {
    currentProgressValue = newCurrentProgressValue;
}
function getCurrentProgressValue() {
    return currentProgressValue;
}
let progressStep = 0;
let currentProgressValue = 0;
exports.workspaceCommon = {
    getProgressStep,
    getCurrentProgressValue,
    getData,
    index,
    indexWithProgress,
    indexWithProgressTask,
    registerAction,
    downloadData,
    cancelIndexing,
    handleCancellationRequested,
    handleDidItemIndexed,
    getNotificationLocation,
    getNotificationTitle,
};
//# sourceMappingURL=workspaceCommon.js.map