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
exports.actionProcessor = void 0;
const actionProcessorEventsEmitter_1 = require("./actionProcessorEventsEmitter");
const types_1 = require("./types");
const utils_1 = require("./utils");
function add(action) {
    assignId(action);
    addToQueue(action);
}
function assignId(action) {
    const actionId = getActionId();
    action.id = actionId;
    setActionId(actionId + 1);
}
function addToQueue(action) {
    exports.actionProcessor.queue.push(action);
}
function processIfIsNotBusy() {
    return __awaiter(this, void 0, void 0, function* () {
        !exports.actionProcessor.getIsBusy() && (yield exports.actionProcessor.process());
    });
}
function process() {
    return __awaiter(this, void 0, void 0, function* () {
        actionProcessorEventsEmitter_1.onWillProcessingEventEmitter.fire();
        setIsBusy(true);
        yield processEachAction();
        setIsBusy(false);
        setPreviousAction(undefined);
        actionProcessorEventsEmitter_1.onDidProcessingEventEmitter.fire();
    });
}
function processEachAction() {
    return __awaiter(this, void 0, void 0, function* () {
        while (exports.actionProcessor.queue.length) {
            reduce();
            const action = getNextActionFromQueue();
            setPreviousAction(action);
            action && actionProcessorEventsEmitter_1.onWillExecuteActionEventEmitter.fire(action);
            action && (yield action.fn());
        }
    });
}
function setIsBusy(value) {
    isBusy = value;
}
function getIsBusy() {
    return isBusy;
}
function getNextActionFromQueue() {
    return exports.actionProcessor.queue.shift();
}
function reduce() {
    reduceRebuilds();
    reduceUpdates();
    reduceRemoves();
}
function reduceRebuilds() {
    reduceByActionType(types_1.ActionType.Rebuild);
}
function reduceUpdates() {
    reduceByActionType(types_1.ActionType.Update);
}
function reduceRemoves() {
    reduceByActionType(types_1.ActionType.Remove);
}
function reduceByActionType(actionType) {
    const actions = getActionsFromQueueByType(actionType);
    actionType === types_1.ActionType.Rebuild
        ? reduceRebuildAction(actionType, actions)
        : reduceUpdateRemoveAction(actionType, actions);
}
function reduceRebuildAction(actionType, actions) {
    if (isPreviousActionRebuildType()) {
        exports.actionProcessor.queue = [];
    }
    else if (ifActionArrayContainsRebuildType(actions)) {
        const last = utils_1.utils.getLastFromArray(exports.actionProcessor.queue, (action) => action.type === actionType);
        exports.actionProcessor.queue = [last];
    }
}
function isPreviousActionRebuildType() {
    const previousAction = exports.actionProcessor.getPreviousAction();
    return !!previousAction && previousAction.type === types_1.ActionType.Rebuild;
}
function ifActionArrayContainsRebuildType(actions) {
    return actions.some((action) => action.type === types_1.ActionType.Rebuild);
}
function reduceUpdateRemoveAction(actionType, actions) {
    const groupedActions = utils_1.utils.groupBy(actions, (action) => action.uri.path);
    groupedActions.forEach(reduceByFsPath.bind(null, actionType));
}
function reduceByFsPath(actionType, _actionsByFsPath, fsPath) {
    const lastAction = utils_1.utils.getLastFromArray(exports.actionProcessor.queue, (action) => action.type === actionType && action.uri.path === fsPath);
    exports.actionProcessor.queue = exports.actionProcessor.queue.filter(shouldActionRemainInQueue.bind(null, actionType, fsPath, lastAction));
}
function shouldActionRemainInQueue(actionType, fsPath, lastAction, action) {
    return (action.type !== actionType ||
        action.uri.path !== fsPath ||
        action.id === lastAction.id);
}
function getActionsFromQueueByType(actionType) {
    return exports.actionProcessor.queue.filter((action) => action.type === actionType);
}
function setPreviousAction(action) {
    previousAction = action;
}
function getPreviousAction() {
    return previousAction;
}
function register(action) {
    return __awaiter(this, void 0, void 0, function* () {
        exports.actionProcessor.add(action);
        yield processIfIsNotBusy();
    });
}
function getActionId() {
    return actionId;
}
function setActionId(newActionId) {
    actionId = newActionId;
}
let actionId = 0;
let isBusy = false;
let previousAction = undefined;
exports.actionProcessor = {
    queue: [],
    getIsBusy,
    getPreviousAction,
    add,
    process,
    register,
};
//# sourceMappingURL=actionProcessor.js.map