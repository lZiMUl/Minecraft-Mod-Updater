"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const node_process_1 = require("node:process");
const node_console_1 = require("node:console");
const chalk_1 = require("chalk");
const index_1 = tslib_1.__importDefault(require("./core/index"));
const modUpdate = new index_1.default(node_process_1.argv.slice(2)[0], {
    api: ''
});
modUpdate.addListener('download', (mods) => (0, node_console_1.info)(`${(0, chalk_1.magentaBright)('Downloading:')} ${(0, chalk_1.blueBright)(mods.fileName)} {(${(0, chalk_1.yellowBright)(mods.modId)}) [${(0, chalk_1.redBright)(mods.fileID)} => ${(0, chalk_1.greenBright)(mods.id)}]} -> ${(0, chalk_1.blueBright)(mods.downloadUrl)}`));
modUpdate.addListener('downloaded', (mods) => (0, node_console_1.info)(`${(0, chalk_1.greenBright)('The download is complete')}: ${(0, chalk_1.blueBright)(mods.fileName)}\n`));
modUpdate.addListener('skipped', (mods) => (0, node_console_1.warn)(`${(0, chalk_1.greenBright)('Already the latest version, the update has been skipped')}: ${(0, chalk_1.blueBright)(mods.fileName)} (${(0, chalk_1.yellowBright)(mods.modId)} [${(0, chalk_1.greenBright)(mods.fileID)} == ${(0, chalk_1.greenBright)(mods.id)}]) \n`));
modUpdate.addListener('done', (mods) => (0, node_console_1.info)(mods, '\n', (0, chalk_1.greenBright)('The update is complete')));
modUpdate.addListener('error', (mods) => (0, node_console_1.error)(`${(0, chalk_1.redBright)('=====Error: Unable to get file address, please download it manually=====')}\nMod ID: ${(0, chalk_1.yellowBright)(mods.modId)}\nThe name of the mod file: ${(0, chalk_1.magentaBright)(mods.fileName)}\n`));
