#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const node_process_1 = require("node:process");
const node_console_1 = require("node:console");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const commander_1 = require("commander");
const chalk_1 = require("chalk");
const index_1 = tslib_1.__importDefault(require("./core/index"));
const command = new commander_1.Command('mcmu');
const program = command.description('Minecraft Mod Updater').version('1.4.10');
program.option('-fp, --filePath <path>', 'path to the mod file', (0, node_path_1.join)((0, node_path_1.resolve)('.'), './manifest.json'));
program.option('-od, --outDir <path>', 'module output position', (0, node_path_1.resolve)('.'));
program.option('-ak, --apiKey <text>', 'api key', node_process_1.env.MCMU_APIKEY ?? 'none');
program.option('-fd, --forceDownload', 'force download', false);
program.parse(node_process_1.argv);
const { filePath, outDir, apiKey, forceDownload } = program.opts();
if (apiKey !== 'none') {
    if ((0, node_fs_1.existsSync)(filePath)) {
        const modUpdate = new index_1.default(filePath, {
            outDir,
            apiKey,
            forceDownload
        });
        modUpdate.addListener('downloading', (mods) => (0, node_console_1.info)(`${(0, chalk_1.magentaBright)('Downloading:')} ${(0, chalk_1.blueBright)(mods.fileName)} {(${(0, chalk_1.yellowBright)(mods.modId)}) [${(0, chalk_1.redBright)(mods.fileID)} => ${(0, chalk_1.greenBright)(mods.id)}]} -> ${(0, chalk_1.blueBright)(mods.downloadUrl)}`));
        modUpdate.addListener('downloaded', (mods) => (0, node_console_1.info)(`${(0, chalk_1.greenBright)('The download is complete')}: ${(0, chalk_1.blueBright)(mods.fileName)}\n`));
        modUpdate.addListener('skipped', (mods) => (0, node_console_1.warn)(`${(0, chalk_1.greenBright)('Already the latest version, the update has been skipped')}: ${(0, chalk_1.blueBright)(mods.fileName)} (${(0, chalk_1.yellowBright)(mods.modId)} [${(0, chalk_1.greenBright)(mods.fileID)} == ${(0, chalk_1.greenBright)(mods.id)}]) \n`));
        modUpdate.addListener('finished', (mods) => (0, node_console_1.info)(mods, '\n', (0, chalk_1.greenBright)('The update is complete')));
        modUpdate.addListener('errored', (mods) => (0, node_console_1.error)(`${(0, chalk_1.redBright)('=====Error: Unable to get file address, please download it manually=====')}\nMod ID: ${(0, chalk_1.yellowBright)(mods.modId)}\nThe name of the mod file: ${(0, chalk_1.magentaBright)(mods.fileName)}\n`));
    }
    else {
        (0, node_console_1.error)((0, chalk_1.redBright)('The manifest.json file does not exist, please create it and try again alive to view the help with mcmu -h'));
    }
}
else {
    (0, node_console_1.warn)((0, chalk_1.yellowBright)('The MCMU_APIKEY system environment variable could not be found, please add the system environment variable and try again alive to view the help with mcmu -h'));
}
