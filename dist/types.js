"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcludeMode = exports.DetailedActionType = exports.ActionType = exports.ActionTrigger = void 0;
var ActionTrigger;
(function (ActionTrigger) {
    ActionTrigger["Search"] = "Search";
    ActionTrigger["Reload"] = "Reload";
    ActionTrigger["Startup"] = "Startup";
    ActionTrigger["ConfigurationChange"] = "ConfigurationChange";
    ActionTrigger["WorkspaceFoldersChange"] = "WorkspaceFoldersChange";
    ActionTrigger["DidChangeTextDocument"] = "DidChangeTextDocument";
    ActionTrigger["DidRenameFiles"] = "DidRenameFiles";
    ActionTrigger["DidCreateFiles"] = "DidCreateFiles";
    ActionTrigger["DidDeleteFiles"] = "DidDeleteFiles";
    ActionTrigger["ReloadUnsavedUri"] = "ReloadUnsavedUri";
})(ActionTrigger = exports.ActionTrigger || (exports.ActionTrigger = {}));
var ActionType;
(function (ActionType) {
    ActionType["Rebuild"] = "Rebuild";
    ActionType["Update"] = "Update";
    ActionType["Remove"] = "Remove";
})(ActionType = exports.ActionType || (exports.ActionType = {}));
var DetailedActionType;
(function (DetailedActionType) {
    DetailedActionType["CreateNewFile"] = "CreateNewFile";
    DetailedActionType["CreateNewDirectory"] = "CreateNewDirectory";
    DetailedActionType["RenameOrMoveFile"] = "RenameOrMoveFile";
    DetailedActionType["RenameOrMoveDirectory"] = "RenameOrMoveDirectory";
    DetailedActionType["RemoveFile"] = "RemoveFile";
    DetailedActionType["RemoveDirectory"] = "RemoveDirectory";
    DetailedActionType["TextChange"] = "TextChange";
    DetailedActionType["ReloadUnsavedUri"] = "ReloadUnsavedUri";
})(DetailedActionType = exports.DetailedActionType || (exports.DetailedActionType = {}));
var ExcludeMode;
(function (ExcludeMode) {
    ExcludeMode["SearchEverywhere"] = "search everywhere";
    ExcludeMode["FilesAndSearch"] = "files and search";
    ExcludeMode["Gitignore"] = "gitignore";
})(ExcludeMode = exports.ExcludeMode || (exports.ExcludeMode = {}));
//# sourceMappingURL=types.js.map