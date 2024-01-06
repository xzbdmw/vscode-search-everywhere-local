"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataConverter = void 0;
const vscode = require("vscode");
const config_1 = require("./config");
const utils_1 = require("./utils");
function getItemFilterPhraseForKind(symbolKind) {
    return exports.dataConverter.getItemsFilterPhrases()[symbolKind];
}
function mapDataToQpData(data) {
    let qpData = [];
    for (let item of data.values()) {
        if (exports.dataConverter.getIsCancelled()) {
            qpData = [];
            break;
        }
        item.elements.forEach((element) => {
            qpData.push(mapItemElementToQpItem(item.uri, element));
        });
    }
    return qpData;
}
function mapItemElementToQpItem(uri, item) {
    return item.hasOwnProperty("range")
        ? mapDocumentSymbolToQpItem(uri, item)
        : mapUriToQpItem(item);
}
function mapDocumentSymbolToQpItem(uri, symbol) {
    const splitter = utils_1.utils.getSplitter();
    const symbolName = symbol.name.split(splitter);
    const parent = symbolName.length === 2 ? symbolName[0] : "";
    const name = symbolName.length === 2 ? symbolName[1] : symbol.name;
    const icons = exports.dataConverter.getIcons();
    const icon = icons[symbol.kind] ? `$(${icons[symbol.kind]})` : "";
    const label = icon ? `${icon} ${name}` : name;
    const itemFilterPhrase = getItemFilterPhraseForKind(symbol.kind);
    const description = getDocumentSymbolToQpItemDescription(itemFilterPhrase, name, symbol, parent);
    return createQuickPickItem(uri, symbol.kind, symbol.range.start, symbol.range.end, label, description);
}
function getDocumentSymbolToQpItemDescription(itemFilterPhrase, name, symbol, parent) {
    return `${exports.dataConverter.getShouldUseItemsFilterPhrases() && itemFilterPhrase
        ? `[${itemFilterPhrase}${name}] `
        : ""}${vscode.SymbolKind[symbol.kind]} at ${symbol.range.isSingleLine
            ? `line: ${symbol.range.start.line + 1}`
            : `lines: ${symbol.range.start.line + 1} - ${symbol.range.end.line + 1}${parent ? ` in ${parent}` : ""}`}`;
}
function mapUriToQpItem(uri) {
    const symbolKind = 0;
    const name = utils_1.utils.getNameFromUri(uri);
    const icons = exports.dataConverter.getIcons();
    const icon = icons[symbolKind] ? `$(${icons[symbolKind]})` : "";
    const label = icon ? `${icon} ${name}` : name;
    const start = new vscode.Position(0, 0);
    const end = new vscode.Position(0, 0);
    const itemFilterPhrase = getItemFilterPhraseForKind(symbolKind);
    const description = getUriToQpItemDescription(itemFilterPhrase, name);
    return createQuickPickItem(uri, symbolKind, start, end, label, description);
}
function getUriToQpItemDescription(itemFilterPhrase, name) {
    return `${exports.dataConverter.getShouldUseItemsFilterPhrases() && itemFilterPhrase
        ? `[${itemFilterPhrase}${name}] `
        : ""}File`;
}
function createQuickPickItem(uri, symbolKind, start, end, label, description) {
    // 将路径分割成数组并提取最后两个元素
    const pathSegments = uri.path.split('/');
    const lastTwoPathSegments = pathSegments.slice(-2).join('/');
    console.log("label" + label)
    return {
        uri,
        symbolKind,
        range: {
            start,
            end,
        },
        label,
        // detail: utils_1.utils.normalizeUriPath(uri.path),
        description: lastTwoPathSegments,
        // buttons: [
        //   {
        //     iconPath: new vscode.ThemeIcon("open-preview"),
        //     tooltip: "Open to the side",
        //   },
        // ],
    };
}
function reload() {
    exports.dataConverter.fetchConfig();
}
function cancel() {
    exports.dataConverter.setCancelled(true);
}
function convertToQpData(data) {
    const qpData = mapDataToQpData(data.items);
    exports.dataConverter.setCancelled(false);
    return qpData;
}
function fetchConfig() {
    const icons = (0, config_1.fetchIcons)();
    setIcons(icons);
    const shouldUseItemsFilterPhrases = (0, config_1.fetchShouldUseItemsFilterPhrases)();
    setShouldUseItemsFilterPhrases(shouldUseItemsFilterPhrases);
    const itemsFilterPhrases = (0, config_1.fetchItemsFilterPhrases)();
    setItemsFilterPhrases(itemsFilterPhrases);
}
function setCancelled(value) {
    isCancelled = value;
}
function getIsCancelled() {
    return isCancelled;
}
function setIcons(newIcons) {
    icons = newIcons;
}
function getIcons() {
    return icons;
}
function setShouldUseItemsFilterPhrases(value) {
    shouldUseItemsFilterPhrases = value;
}
function getShouldUseItemsFilterPhrases() {
    return shouldUseItemsFilterPhrases;
}
function setItemsFilterPhrases(newItemsFilterPhrases) {
    itemsFilterPhrases = newItemsFilterPhrases;
}
function getItemsFilterPhrases() {
    return itemsFilterPhrases;
}
let isCancelled = false;
let icons = {};
let shouldUseItemsFilterPhrases = false;
let itemsFilterPhrases = {};
exports.dataConverter = {
    setCancelled,
    getIsCancelled,
    getIcons,
    getShouldUseItemsFilterPhrases,
    getItemsFilterPhrases,
    reload,
    cancel,
    convertToQpData,
    fetchConfig,
};
//# sourceMappingURL=dataConverter.js.map