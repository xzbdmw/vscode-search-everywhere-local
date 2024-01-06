"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchShouldWorkspaceDataBeCached = exports.fetchExcludeMode = exports.fetchFilesAndSearchExclude = exports.fetchInclude = exports.fetchExclude = exports.fetchShouldSearchSelection = exports.fetchShouldItemsBeSorted = exports.fetchHelpPhrase = exports.fetchItemsFilterPhrases = exports.fetchShouldUseItemsFilterPhrases = exports.fetchItemsFilter = exports.fetchIcons = exports.fetchShouldUseDebounce = exports.fetchShouldHighlightSymbol = exports.fetchShouldInitOnStartup = exports.fetchShouldDisplayNotificationInStatusBar = void 0;
const vscode = require("vscode");
const cache_1 = require("./cache");
const types_1 = require("./types");
const defaultSection = "searchEverywhere";
const keys = {
    shouldDisplayNotificationInStatusBar: {
        name: "shouldDisplayNotificationInStatusBar",
        value: false,
    },
    shouldInitOnStartup: {
        name: "shouldInitOnStartup",
        value: false,
    },
    shouldHighlightSymbol: {
        name: "shouldHighlightSymbol",
        value: false,
    },
    shouldUseDebounce: {
        name: "shouldUseDebounce",
        value: false,
    },
    icons: {
        name: "icons",
        value: {},
    },
    itemsFilter: {
        name: "itemsFilter",
        value: {
            allowedKinds: [],
            ignoredKinds: [],
            ignoredNames: [],
        },
    },
    shouldUseItemsFilterPhrases: {
        name: "shouldUseItemsFilterPhrases",
        value: false,
    },
    itemsFilterPhrases: {
        name: "itemsFilterPhrases",
        value: {},
    },
    helpPhrase: {
        name: "helpPhrase",
        value: "?",
    },
    shouldItemsBeSorted: {
        name: "shouldItemsBeSorted",
        value: true,
    },
    shouldSearchSelection: {
        name: "shouldSearchSelection",
        value: true,
    },
    exclude: {
        name: "exclude",
        value: [],
    },
    include: {
        name: "include",
        value: "",
    },
    excludeMode: {
        name: "excludeMode",
        value: types_1.ExcludeMode.SearchEverywhere,
    },
    shouldWorkspaceDataBeCached: {
        name: "shouldWorkspaceDataBeCached",
        value: true,
    },
};
function getConfigurationByKey(key, defaultValue, customSection) {
    return getConfiguration(`${customSection ? customSection : defaultSection}.${key}`, defaultValue);
}
function get(key, defaultValue, customSection) {
    const cacheKey = `${customSection ? customSection : defaultSection}.${key}`;
    let value = (0, cache_1.getConfigByKey)(cacheKey);
    if (!value) {
        value = getConfigurationByKey(key, defaultValue, customSection);
        (0, cache_1.updateConfigByKey)(cacheKey, value);
    }
    return value;
}
function getFilesExclude() {
    return get(keys.exclude.name, keys.exclude.value, "files");
}
function getSearchExclude() {
    return get(keys.exclude.name, keys.exclude.value, "search");
}
function getConfiguration(section, defaultValue) {
    const config = vscode.workspace.getConfiguration("");
    return config.get(section, defaultValue);
}
function fetchShouldDisplayNotificationInStatusBar() {
    return get(keys.shouldDisplayNotificationInStatusBar.name, keys.shouldDisplayNotificationInStatusBar.value);
}
exports.fetchShouldDisplayNotificationInStatusBar = fetchShouldDisplayNotificationInStatusBar;
function fetchShouldInitOnStartup() {
    return get(keys.shouldInitOnStartup.name, keys.shouldInitOnStartup.value);
}
exports.fetchShouldInitOnStartup = fetchShouldInitOnStartup;
function fetchShouldHighlightSymbol() {
    return get(keys.shouldHighlightSymbol.name, keys.shouldHighlightSymbol.value);
}
exports.fetchShouldHighlightSymbol = fetchShouldHighlightSymbol;
function fetchShouldUseDebounce() {
    return get(keys.shouldUseDebounce.name, keys.shouldUseDebounce.value);
}
exports.fetchShouldUseDebounce = fetchShouldUseDebounce;
function fetchIcons() {
    return get(keys.icons.name, keys.icons.value);
}
exports.fetchIcons = fetchIcons;
function fetchItemsFilter() {
    return get(keys.itemsFilter.name, keys.itemsFilter.value);
}
exports.fetchItemsFilter = fetchItemsFilter;
function fetchShouldUseItemsFilterPhrases() {
    return get(keys.shouldUseItemsFilterPhrases.name, keys.shouldUseItemsFilterPhrases.value);
}
exports.fetchShouldUseItemsFilterPhrases = fetchShouldUseItemsFilterPhrases;
function fetchItemsFilterPhrases() {
    return get(keys.itemsFilterPhrases.name, keys.itemsFilterPhrases.value);
}
exports.fetchItemsFilterPhrases = fetchItemsFilterPhrases;
function fetchHelpPhrase() {
    return get(keys.helpPhrase.name, keys.helpPhrase.value);
}
exports.fetchHelpPhrase = fetchHelpPhrase;
function fetchShouldItemsBeSorted() {
    return get(keys.shouldItemsBeSorted.name, keys.shouldItemsBeSorted.value);
}
exports.fetchShouldItemsBeSorted = fetchShouldItemsBeSorted;
function fetchShouldSearchSelection() {
    return get(keys.shouldSearchSelection.name, keys.shouldSearchSelection.value);
}
exports.fetchShouldSearchSelection = fetchShouldSearchSelection;
function fetchExclude() {
    return get(keys.exclude.name, keys.exclude.value);
}
exports.fetchExclude = fetchExclude;
function fetchInclude() {
    return get(keys.include.name, keys.include.value);
}
exports.fetchInclude = fetchInclude;
function fetchFilesAndSearchExclude() {
    let excludePatterns = [];
    const filesExcludePatterns = getFilesExclude();
    const searchExcludePatterns = getSearchExclude();
    const allExcludePatterns = Object.assign({}, filesExcludePatterns, searchExcludePatterns);
    for (let [key, value] of Object.entries(allExcludePatterns)) {
        value && excludePatterns.push(key);
    }
    return excludePatterns;
}
exports.fetchFilesAndSearchExclude = fetchFilesAndSearchExclude;
function fetchExcludeMode() {
    return get(keys.excludeMode.name, keys.excludeMode.value);
}
exports.fetchExcludeMode = fetchExcludeMode;
function fetchShouldWorkspaceDataBeCached() {
    return get(keys.shouldWorkspaceDataBeCached.name, keys.shouldWorkspaceDataBeCached.value);
}
exports.fetchShouldWorkspaceDataBeCached = fetchShouldWorkspaceDataBeCached;
//# sourceMappingURL=config.js.map