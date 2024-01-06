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
exports.quickPick = void 0;
const vscode = require("vscode");
const config_1 = require("./config");
const utils_1 = require("./utils");
const debounce = require("debounce");
let currentDecoration = null
let firstOpen = true
let recordedPosition = null
let activeEditor = null
let recordedUri = null
function disposeOnDidChangeValueEventListeners() {
    exports.quickPick
        .getOnDidChangeValueEventListeners()
        .forEach((eventListener) => eventListener.dispose());
    exports.quickPick.setOnDidChangeValueEventListeners([]);
}
function registerOnDidChangeValueEventListeners() {
    (0, config_1.fetchShouldUseDebounce)()
        ? registerOnDidChangeValueWithDebounceEventListeners()
        : registerOnDidChangeValueWithoutDebounceEventListeners();
}
function registerOnDidChangeValueWithDebounceEventListeners() {
    const control = exports.quickPick.getControl();
    const onDidChangeValueClearingEventListener = control.onDidChangeValue(handleDidChangeValueClearing);
    const onDidChangeValueEventListener = control.onDidChangeValue(debounce(handleDidChangeValue, 400));
    const onDidChangeValueEventListeners = exports.quickPick.getOnDidChangeValueEventListeners();
    onDidChangeValueEventListeners.push(onDidChangeValueClearingEventListener);
    onDidChangeValueEventListeners.push(onDidChangeValueEventListener);
}
function registerOnDidChangeValueWithoutDebounceEventListeners() {
    const control = exports.quickPick.getControl();
    const onDidChangeValueEventListener = control.onDidChangeValue(handleDidChangeValue);
    exports.quickPick
        .getOnDidChangeValueEventListeners()
        .push(onDidChangeValueEventListener);
}
function openSelected(qpItem) {
    return __awaiter(this, void 0, void 0, function* () {
        shouldLoadItemsForFilterPhrase(qpItem)
            ? loadItemsForFilterPhrase(qpItem)
            : yield exports.quickPick.openItem(qpItem);
    });
}
function shouldLoadItemsForFilterPhrase(qpItem) {
    return exports.quickPick.getShouldUseItemsFilterPhrases() && !!qpItem.isHelp;
}
function loadItemsForFilterPhrase(qpItem) {
    const itemsFilterPhrases = exports.quickPick.getItemsFilterPhrases();
    const filterPhrase = itemsFilterPhrases[qpItem.symbolKind];
    exports.quickPick.setText(filterPhrase);
    exports.quickPick.loadItems();
}
function openItem(qpItem, viewColumn = vscode.ViewColumn.Active) {
    return __awaiter(this, void 0, void 0, function* () {
        const uriOrFileName = qpItem.uri.scheme === "file" ? qpItem.uri.path : qpItem.uri;
        const document = uriOrFileName instanceof vscode.Uri
            ? yield vscode.workspace.openTextDocument(uriOrFileName)
            : yield vscode.workspace.openTextDocument(uriOrFileName);
        const editor = yield vscode.window.showTextDocument(document, viewColumn);
        selectQpItem(editor, qpItem);
    });
}
function selectQpItem(editor, qpItem) {
    editor.selection = getSelectionForQpItem(qpItem, (0, config_1.fetchShouldHighlightSymbol)());
    editor.revealRange(qpItem.range, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
}
function getSelectionForQpItem(qpItem, shouldHighlightSymbol) {
    const { range } = qpItem;
    const start = new vscode.Position(range.start.line, range.start.character);
    const end = new vscode.Position(range.end.line, range.end.character);
    return shouldHighlightSymbol
        ? new vscode.Selection(start, end)
        : new vscode.Selection(start, start);
}
function collectHelpItems() {
    const items = [];
    const itemsFilterPhrases = exports.quickPick.getItemsFilterPhrases();
    for (const kind in itemsFilterPhrases) {
        const filterPhrase = itemsFilterPhrases[kind];
        const item = getHelpItemForKind(kind, filterPhrase);
        items.push(item);
    }
    return items;
}
function getHelpItemForKind(symbolKind, itemFilterPhrase) {
    return {
        label: `${exports.quickPick.getHelpPhrase()} Type ${itemFilterPhrase} for limit results to ${vscode.SymbolKind[parseInt(symbolKind)]} only`,
        symbolKind: Number(symbolKind),
        isHelp: true,
        uri: vscode.Uri.parse("#"),
    };
}
function fetchConfig() {
    const shouldUseItemsFilterPhrases = (0, config_1.fetchShouldUseItemsFilterPhrases)();
    setShouldUseItemsFilterPhrases(shouldUseItemsFilterPhrases);
    const helpPhrase = (0, config_1.fetchHelpPhrase)();
    setHelpPhrase(helpPhrase);
    const itemsFilterPhrases = (0, config_1.fetchItemsFilterPhrases)();
    setItemsFilterPhrases(itemsFilterPhrases);
    const shouldItemsBeSorted = (0, config_1.fetchShouldItemsBeSorted)();
    setShouldItemsBeSorted(shouldItemsBeSorted);
}
function reloadSortingSettings() {
    const shouldItemsBeSorted = (0, config_1.fetchShouldItemsBeSorted)();
    setShouldItemsBeSorted(shouldItemsBeSorted);
    toggleKeepingSeparatorsVisibleOnFiltering();
}
function fetchHelpData() {
    const helpItems = collectHelpItems();
    setHelpItems(helpItems);
}
function handleDidChangeValueClearing() {
    const control = exports.quickPick.getControl();
    control.items = [];
}
function handleDidChangeValue(text) {
    shouldLoadHelpItems(text) ? exports.quickPick.loadHelpItems() : exports.quickPick.loadItems();
}
function shouldLoadHelpItems(text) {
    const helpPhrase = exports.quickPick.getHelpPhrase();
    return (exports.quickPick.getShouldUseItemsFilterPhrases() &&
        !!helpPhrase &&
        text === helpPhrase);
}
function handleDidAccept() {
    return __awaiter(this, void 0, void 0, function* () {
        const control = exports.quickPick.getControl();
        const selectedItem = control.selectedItems[0];
        selectedItem && (yield openSelected(selectedItem));
    });
}
function handleDidHide() {
    if (recordedUri && recordedPosition) {
        vscode.workspace.openTextDocument(recordedUri).then(document => {
            vscode.window.showTextDocument(document).then(editor => {
                const newPosition = new vscode.Position(recordedPosition.line, recordedPosition.character);
                editor.selection = new vscode.Selection(newPosition, newPosition);
                editor.revealRange(new vscode.Range(newPosition, newPosition));
            });
        });
    }

    if (currentDecoration) {
        currentDecoration.dispose()
    }
    firstOpen = true
    exports.quickPick.setText("");
}
function handleDidTriggerItemButton({ item: qpItem, }) {
    return __awaiter(this, void 0, void 0, function* () {
        yield exports.quickPick.openItem(qpItem, vscode.ViewColumn.Beside);
    });
}
function init() {
    const control = vscode.window.createQuickPick();
    setControl(control);
    control.matchOnDetail = true;
    control.matchOnDescription = true;
    exports.quickPick.fetchConfig();
    fetchHelpData();
    toggleKeepingSeparatorsVisibleOnFiltering();
    registerEventListeners();
}
function toggleKeepingSeparatorsVisibleOnFiltering() {
    const shouldItemsBeSorted = exports.quickPick.getShouldItemsBeSorted();
    const control = exports.quickPick.getControl();
    // necessary hack to keep separators visible on filtering
    control.sortByLabel = !shouldItemsBeSorted;
}
function registerEventListeners() {
    const control = exports.quickPick.getControl();
    control.onDidHide(handleDidHide);
    control.onDidAccept(handleDidAccept);
    control.onDidTriggerItemButton(handleDidTriggerItemButton);
    control.onDidChangeActive(handleDidChangeActive);
    registerOnDidChangeValueEventListeners();
}

function handleDidChangeActive(items) {
    if (items.length > 0) {
        const activeItem = items[0];
        peekItem(activeItem);
    }
}

function createRangeForQpItem(qpItem) {
    // 创建一个范围，从行的开始到结束
    const start = new vscode.Position(qpItem.range.start.line, 0); // 行的开始
    const end = new vscode.Position(qpItem.range.end.line, 200); // 行的一个假设的结束位置

    return new vscode.Range(start, end);
}

function peekItem(qpItem) {
    if (firstOpen) {
        firstOpen = false
        return null
    }
    return __awaiter(this, void 0, void 0, function* () {
        if (qpItem.uri && qpItem.uri.scheme === "file") {
            const document = yield vscode.workspace.openTextDocument(qpItem.uri);
            vscode.window.showTextDocument(document, {
                preview: true,
                preserveFocus: true
            }).then(editor => {
                const range = createRangeForQpItem(qpItem);
                if (currentDecoration) {
                    currentDecoration.dispose();
                }
                currentDecoration = vscode.window.createTextEditorDecorationType({
                    backgroundColor: 'rgba(253, 255, 0, 0.2)'
                });
                editor.setDecorations(currentDecoration, [range]);

                const position = qpItem.range.start;
                editor.selection = new vscode.Selection(position, position);
                editor.revealRange(qpItem.range, vscode.TextEditorRevealType.InCenter);
            });
        }
    });
}


function reloadOnDidChangeValueEventListener() {
    disposeOnDidChangeValueEventListeners();
    registerOnDidChangeValueEventListeners();
}
function reload() {
    exports.quickPick.fetchConfig();
    fetchHelpData();
}
function isInitialized() {
    return !!exports.quickPick.getControl();
}
function show() {
    if (firstOpen) {
        console.log('show')
        recordPosition()
    }
    const control = exports.quickPick.getControl();
    control.show();
}
// 记录当前编辑器位置的函数
function recordPosition() {
    activeEditor = vscode.window.activeTextEditor;
    recordedUri = activeEditor.document.uri;
    recordedPosition = activeEditor.selection.active;
    console.log(recordedPosition)
}
function loadItems() {
    exports.quickPick.getShouldItemsBeSorted() ? loadSortedItems() : loadUnsortedItems();
}
function loadUnsortedItems() {
    const control = exports.quickPick.getControl();
    control.items = exports.quickPick.getItems();
}
function loadSortedItems() {
    const control = exports.quickPick.getControl();
    const items = [...exports.quickPick.getItems()];
    items.sort((firstItem, secondItem) => {
        if (firstItem.symbolKind > secondItem.symbolKind) {
            return 1;
        }
        if (firstItem.symbolKind < secondItem.symbolKind) {
            return -1;
        }
        return 0;
    });
    const itemsWithSeparators = addSeparatorItemForEachSymbolKind(items);
    control.items = itemsWithSeparators;
}
function loadHelpItems() {
    const control = exports.quickPick.getControl();
    control.items = exports.quickPick.getHelpItems();
}
function addSeparatorItemForEachSymbolKind(items) {
    const sortedItems = utils_1.utils.groupBy(items, (item) => item.symbolKind.toString());
    const sortedItemsEntries = sortedItems.entries();
    for (const entry of sortedItemsEntries) {
        const symbolKind = parseInt(entry[0]);
        const items = entry[1];
        items.unshift({
            label: `${vscode.SymbolKind[symbolKind]}`,
            kind: vscode.QuickPickItemKind.Separator,
            symbolKind: vscode.QuickPickItemKind.Separator,
            uri: vscode.Uri.parse("#"),
        });
    }
    return Array.from(sortedItems.values()).flat();
}
function showLoading(value) {
    const control = exports.quickPick.getControl();
    control.busy = value;
}
function setText(text) {
    const control = exports.quickPick.getControl();
    control.value = text;
}
function setPlaceholder(isBusy) {
    const control = exports.quickPick.getControl();
    const helpPhrase = exports.quickPick.getHelpPhrase();
    control.placeholder = isBusy
        ? "Please wait, loading..."
        : exports.quickPick.getShouldUseItemsFilterPhrases()
            ? `${helpPhrase
                ? `Type ${helpPhrase} for help or start typing file or symbol name...`
                : `Help phrase not set. Start typing file or symbol name...`}`
            : "Start typing file or symbol name...";
}
let control;
let items = [];
let shouldUseItemsFilterPhrases;
let helpPhrase;
let shouldItemsBeSorted;
let itemsFilterPhrases;
let helpItems;
let onDidChangeValueEventListeners = [];
function getControl() {
    return control;
}
function setControl(newControl) {
    control = newControl;
}
function getItems() {
    return items;
}
function setItems(newItems) {
    reinitQpItemsButton(newItems);
    items = newItems;
}
function reinitQpItemsButton(data) {
    data.forEach((item) => (item.buttons = [
        {
            iconPath: new vscode.ThemeIcon("open-preview"),
            tooltip: "Open to the side",
        },
    ]));
}
function getShouldUseItemsFilterPhrases() {
    return shouldUseItemsFilterPhrases;
}
function setShouldUseItemsFilterPhrases(newShouldUseItemsFilterPhrases) {
    shouldUseItemsFilterPhrases = newShouldUseItemsFilterPhrases;
}
function getHelpPhrase() {
    return helpPhrase;
}
function setHelpPhrase(newHelpPhrase) {
    helpPhrase = newHelpPhrase;
}
function getShouldItemsBeSorted() {
    return shouldItemsBeSorted;
}
function setShouldItemsBeSorted(newshouldItemsBeSorted) {
    shouldItemsBeSorted = newshouldItemsBeSorted;
}
function getItemsFilterPhrases() {
    return itemsFilterPhrases;
}
function setItemsFilterPhrases(newItemsFilterPhrases) {
    itemsFilterPhrases = newItemsFilterPhrases;
}
function getHelpItems() {
    return helpItems;
}
function setHelpItems(newHelpItems) {
    helpItems = newHelpItems;
}
function getOnDidChangeValueEventListeners() {
    return onDidChangeValueEventListeners;
}
function setOnDidChangeValueEventListeners(newOnDidChangeValueEventListeners) {
    onDidChangeValueEventListeners = newOnDidChangeValueEventListeners;
}
exports.quickPick = {
    getControl,
    getItems,
    setItems,
    getShouldUseItemsFilterPhrases,
    getHelpPhrase,
    getShouldItemsBeSorted,
    toggleKeepingSeparatorsVisibleOnFiltering,
    getItemsFilterPhrases,
    getHelpItems,
    getOnDidChangeValueEventListeners,
    setOnDidChangeValueEventListeners,
    init,
    reloadOnDidChangeValueEventListener,
    reloadSortingSettings,
    reload,
    isInitialized,
    show,
    loadItems,
    loadHelpItems,
    showLoading,
    setText,
    setPlaceholder,
    fetchConfig,
    openItem,
    handleDidChangeValueClearing,
    handleDidChangeValue,
    handleDidAccept,
    handleDidHide,
    handleDidTriggerItemButton,
    disposeOnDidChangeValueEventListeners,
};
//# sourceMappingURL=quickPick.js.map