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
exports.dataService = void 0;
const vscode = require("vscode");
const config_1 = require("./config");
const dataServiceEventsEmitter_1 = require("./dataServiceEventsEmitter");
const patternProvider_1 = require("./patternProvider");
const utils_1 = require("./utils");
function fetchUris() {
    return __awaiter(this, void 0, void 0, function* () {
        const includePatterns = patternProvider_1.patternProvider.getIncludePatterns();
        const excludePatterns = yield patternProvider_1.patternProvider.getExcludePatterns();
        try {
            return yield vscode.workspace.findFiles(includePatterns, excludePatterns);
        }
        catch (error) {
            utils_1.utils.printErrorMessage(error);
            return Promise.resolve([]);
        }
    });
}
function getUrisOrFetchIfEmpty(uris) {
    return __awaiter(this, void 0, void 0, function* () {
        return uris && uris.length ? uris : yield exports.dataService.fetchUris();
    });
}
function includeSymbols(workspaceData, uris) {
    return __awaiter(this, void 0, void 0, function* () {
        const fetchSymbolsForUriPromises = [];
        for (let i = 0; i < uris.length; i++) {
            if (exports.dataService.getIsCancelled()) {
                utils_1.utils.clearWorkspaceData(workspaceData);
                break;
            }
            const uri = uris[i];
            fetchSymbolsForUriPromises.push((() => __awaiter(this, void 0, void 0, function* () {
                let symbolsForUri = yield tryToGetSymbolsForUri(uri);
                addSymbolsForUriToWorkspaceData(workspaceData, uri, symbolsForUri);
                dataServiceEventsEmitter_1.onDidItemIndexedEventEmitter.fire(uris.length);
            }))());
        }
        yield Promise.all(fetchSymbolsForUriPromises);
    });
}
function tryToGetSymbolsForUri(uri) {
    return __awaiter(this, void 0, void 0, function* () {
        const maxCounter = 10;
        let counter = 0;
        let symbolsForUri;
        do {
            symbolsForUri = yield exports.dataService.getSymbolsForUri(uri);
            !!counter && (yield utils_1.utils.sleep(120));
            counter++;
        } while (symbolsForUri === undefined && counter < maxCounter);
        return symbolsForUri;
    });
}
function addSymbolsForUriToWorkspaceData(workspaceData, uri, symbolsForUri) {
    symbolsForUri &&
        symbolsForUri.length &&
        workspaceData.items.set(uri.path, {
            uri,
            elements: symbolsForUri,
        });
    workspaceData.count += symbolsForUri ? symbolsForUri.length : 0;
}
function includeUris(workspaceData, uris) {
    const validUris = filterUris(uris);
    for (let i = 0; i < validUris.length; i++) {
        const uri = validUris[i];
        if (exports.dataService.getIsCancelled()) {
            utils_1.utils.clearWorkspaceData(workspaceData);
            break;
        }
        addUriToWorkspaceData(workspaceData, uri);
    }
}
function addUriToWorkspaceData(workspaceData, uri) {
    const item = workspaceData.items.get(uri.path);
    if (item) {
        !ifUriExistsInArray(item.elements, uri) &&
            addUriToExistingArrayOfElements(workspaceData, uri, item);
    }
    else {
        createItemWithArrayOfElementsForUri(workspaceData, uri);
    }
}
function addUriToExistingArrayOfElements(workspaceData, uri, item) {
    item.elements.push(uri);
    workspaceData.count++;
}
function createItemWithArrayOfElementsForUri(workspaceData, uri) {
    workspaceData.items.set(uri.path, {
        uri,
        elements: [uri],
    });
    workspaceData.count++;
}
function ifUriExistsInArray(array, uri) {
    return array.some((uriInArray) => {
        if (!uriInArray.hasOwnProperty("range")) {
            uriInArray = uriInArray;
            return uriInArray.path === uri.path;
        }
        return false;
    });
}
function getSymbolsForUri(uri) {
    return __awaiter(this, void 0, void 0, function* () {
        const allSymbols = yield loadAllSymbolsForUri(uri);
        const symbols = allSymbols
            ? reduceAndFlatSymbolsArrayForUri(allSymbols)
            : undefined;
        return symbols ? filterSymbols(symbols) : undefined;
    });
}
function loadAllSymbolsForUri(uri) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield vscode.commands.executeCommand("vscode.executeDocumentSymbolProvider", uri);
    });
}
function reduceAndFlatSymbolsArrayForUri(symbols, parentName) {
    const flatArrayOfSymbols = [];
    symbols.forEach((symbol) => {
        prepareSymbolNameIfHasParent(symbol, parentName);
        flatArrayOfSymbols.push(symbol);
        if (hasSymbolChildren(symbol)) {
            flatArrayOfSymbols.push(...reduceAndFlatSymbolsArrayForUri(symbol.children, symbol.name));
        }
        symbol.children = [];
    });
    return flatArrayOfSymbols;
}
function prepareSymbolNameIfHasParent(symbol, parentName) {
    const splitter = utils_1.utils.getSplitter();
    if (parentName) {
        parentName = parentName.split(splitter)[0];
        symbol.name = `${parentName}${splitter}${symbol.name}`;
    }
}
function hasSymbolChildren(symbol) {
    return symbol.children && symbol.children.length ? true : false;
}
function filterUris(uris) {
    return uris.filter((uri) => isUriValid(uri));
}
function filterSymbols(symbols) {
    return symbols.filter((symbol) => isSymbolValid(symbol));
}
function isUriValid(uri) {
    return isItemValid(uri);
}
function isSymbolValid(symbol) {
    return isItemValid(symbol);
}
function isItemValid(item) {
    let symbolKind;
    let name;
    const isUri = item.hasOwnProperty("path");
    if (isUri) {
        symbolKind = 0;
        name = item.path.split("/").pop();
    }
    else {
        const documentSymbol = item;
        symbolKind = documentSymbol.kind;
        name = documentSymbol.name;
    }
    const itemsFilter = exports.dataService.getItemsFilter();
    return (isInAllowedKinds(itemsFilter, symbolKind) &&
        isNotInIgnoredKinds(itemsFilter, symbolKind) &&
        isNotInIgnoredNames(itemsFilter, name));
}
function isInAllowedKinds(itemsFilter, symbolKind) {
    return (!(itemsFilter.allowedKinds && itemsFilter.allowedKinds.length) ||
        itemsFilter.allowedKinds.includes(symbolKind));
}
function isNotInIgnoredKinds(itemsFilter, symbolKind) {
    return (!(itemsFilter.ignoredKinds && itemsFilter.ignoredKinds.length) ||
        !itemsFilter.ignoredKinds.includes(symbolKind));
}
function isNotInIgnoredNames(itemsFilter, name) {
    return (!(itemsFilter.ignoredNames && itemsFilter.ignoredNames.length) ||
        !itemsFilter.ignoredNames.some((ignoreEl) => ignoreEl && name && name.toLowerCase().includes(ignoreEl.toLowerCase())));
}
function fetchData(uris) {
    return __awaiter(this, void 0, void 0, function* () {
        const workspaceData = utils_1.utils.createWorkspaceData();
        const uriItems = yield getUrisOrFetchIfEmpty(uris);
        yield includeSymbols(workspaceData, uriItems);
        includeUris(workspaceData, uriItems);
        exports.dataService.setIsCancelled(false);
        return workspaceData;
    });
}
function isUriExistingInWorkspace(uri) {
    return __awaiter(this, void 0, void 0, function* () {
        const uris = yield exports.dataService.fetchUris();
        return uris.some((existingUri) => existingUri.path === uri.path);
    });
}
function fetchConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        const itemsFilter = (0, config_1.fetchItemsFilter)();
        setItemsFilter(itemsFilter);
        yield patternProvider_1.patternProvider.fetchConfig();
    });
}
function reload() {
    exports.dataService.fetchConfig();
}
function cancel() {
    exports.dataService.setIsCancelled(true);
}
function setIsCancelled(value) {
    isCancelled = value;
}
function getIsCancelled() {
    return isCancelled;
}
function setItemsFilter(newItemsFilter) {
    itemsFilter = newItemsFilter;
}
function getItemsFilter() {
    return itemsFilter;
}
let isCancelled = false;
let itemsFilter = {};
exports.dataService = {
    setIsCancelled,
    getIsCancelled,
    getItemsFilter,
    fetchConfig,
    reload,
    cancel,
    fetchData,
    isUriExistingInWorkspace,
    fetchUris,
    getSymbolsForUri,
};
//# sourceMappingURL=dataService.js.map