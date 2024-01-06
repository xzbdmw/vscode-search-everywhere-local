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
exports.activate = exports.deactivate = exports.reload = exports.search = void 0;
const vscode = require("vscode");
const controller_1 = require("./controller");
function search() {
    return __awaiter(this, void 0, void 0, function* () {
        yield controller_1.controller.search();
    });
}
exports.search = search;
function reload() {
    return __awaiter(this, void 0, void 0, function* () {
        yield controller_1.controller.reload();
    });
}
exports.reload = reload;
function deactivate() {
    console.log('Extension "vscode-search-everywhere" has been deactivated.');
}
exports.deactivate = deactivate;
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Extension "vscode-search-everywhere" has been activated.');
        yield controller_1.controller.init(context);
        context.subscriptions.push(vscode.commands.registerCommand("searchEverywhere.search", search.bind(null, controller_1.controller)), vscode.commands.registerCommand("searchEverywhere.reload", reload.bind(null, controller_1.controller)));
        yield controller_1.controller.startup();
    });
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map