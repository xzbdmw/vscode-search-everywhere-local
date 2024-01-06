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
exports.patternProvider = void 0;
const vscode = require("vscode");
const config_1 = require("./config");
const types_1 = require("./types");
const endLineRegex = /[^\r\n]+/g;
const gitignoreFilePattern = "**/.gitignore";
function getGitignoreExclude() {
    return __awaiter(this, void 0, void 0, function* () {
        const gitignoreExcludePatterns = yield getGitignoreOrFallbackExclude();
        return gitignoreExcludePatterns;
    });
}
function getGitignoreOrFallbackExclude() {
    return __awaiter(this, void 0, void 0, function* () {
        const gitignoreExclude = yield fetchGitignoreExclude();
        const fallbackExclude = exports.patternProvider.getFallbackExcludePatterns();
        return gitignoreExclude || fallbackExclude;
    });
}
function fetchGitignoreExclude() {
    return __awaiter(this, void 0, void 0, function* () {
        const gitignoreFile = yield getGitignoreFile();
        if (gitignoreFile) {
            const text = yield getGitignoreFileText(gitignoreFile);
            const lines = textToLines(text);
            return lines.length ? removeLinesWithComments(lines) : null;
        }
        return null;
    });
}
function getGitignoreFile() {
    return __awaiter(this, void 0, void 0, function* () {
        const files = yield vscode.workspace.findFiles(gitignoreFilePattern);
        return files.length >= 1 ? files[0] : null;
    });
}
function getGitignoreFileText(uri) {
    return __awaiter(this, void 0, void 0, function* () {
        const document = yield vscode.workspace.openTextDocument(uri.path);
        return document.getText();
    });
}
function textToLines(text) {
    return text.match(endLineRegex) || [];
}
function removeLinesWithComments(lines) {
    return lines.filter((line) => !line.startsWith("#"));
}
function getExcludePatternsAsString(patterns) {
    const excludePatternsFormat = {
        0: "",
        1: patterns[0],
        [patterns.length > 1 ? patterns.length : -1]: `{${patterns.join(",")}}`,
    };
    return excludePatternsFormat[patterns.length];
}
function getExcludePatterns() {
    return __awaiter(this, void 0, void 0, function* () {
        const excludePatterns = {
            [types_1.ExcludeMode.SearchEverywhere]: exports.patternProvider.getExtensionExcludePatterns(),
            [types_1.ExcludeMode.FilesAndSearch]: exports.patternProvider.getFilesAndSearchExcludePatterns(),
            [types_1.ExcludeMode.Gitignore]: exports.patternProvider.getGitignoreExcludePatterns(),
        };
        return getExcludePatternsAsString(excludePatterns[exports.patternProvider.getExcludeMode()]);
    });
}
function fetchConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        const excludeMode = (0, config_1.fetchExcludeMode)();
        setExcludeMode(excludeMode);
        const includePatterns = (0, config_1.fetchInclude)();
        setIncludePatterns(includePatterns);
        const extensionExcludePatterns = (0, config_1.fetchExclude)();
        setExtensionExcludePatterns(extensionExcludePatterns);
        const fallbackExcludePatterns = exports.patternProvider.getExtensionExcludePatterns();
        setFallbackExcludePatterns(fallbackExcludePatterns);
        const filesAndSearchExcludePatterns = (0, config_1.fetchFilesAndSearchExclude)();
        setFilesAndSearchExcludePatterns(filesAndSearchExcludePatterns);
        const gitignoreExcludePatterns = yield getGitignoreExclude();
        setGitignoreExcludePatterns(gitignoreExcludePatterns);
    });
}
function getExcludeMode() {
    return excludeMode;
}
function setExcludeMode(newExcludeMode) {
    excludeMode = newExcludeMode;
}
function getIncludePatterns() {
    return includePatterns;
}
function setIncludePatterns(newIncludePatterns) {
    includePatterns = newIncludePatterns;
}
function getExtensionExcludePatterns() {
    return extensionExcludePatterns;
}
function setExtensionExcludePatterns(newExtensionExcludePatterns) {
    extensionExcludePatterns = newExtensionExcludePatterns;
}
function getFallbackExcludePatterns() {
    return fallbackExcludePatterns;
}
function setFallbackExcludePatterns(newFallbackExcludePatterns) {
    fallbackExcludePatterns = newFallbackExcludePatterns;
}
function getFilesAndSearchExcludePatterns() {
    return filesAndSearchExcludePatterns;
}
function setFilesAndSearchExcludePatterns(newFilesAndSearchExcludePatterns) {
    filesAndSearchExcludePatterns = newFilesAndSearchExcludePatterns;
}
function getGitignoreExcludePatterns() {
    return gitignoreExcludePatterns;
}
function setGitignoreExcludePatterns(newGitignoreExcludePatterns) {
    gitignoreExcludePatterns = newGitignoreExcludePatterns;
}
let excludeMode = types_1.ExcludeMode.SearchEverywhere;
let includePatterns = "";
let extensionExcludePatterns = [];
let filesAndSearchExcludePatterns = [];
let gitignoreExcludePatterns = [];
let fallbackExcludePatterns = [];
exports.patternProvider = {
    getExcludeMode,
    getIncludePatterns,
    getExtensionExcludePatterns,
    getFilesAndSearchExcludePatterns,
    getGitignoreExcludePatterns,
    getFallbackExcludePatterns,
    getExcludePatterns,
    fetchConfig,
};
//# sourceMappingURL=patternProvider.js.map