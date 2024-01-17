#!/usr/bin/env node
import { argv, env } from 'node:process';
import { error, info, warn } from 'node:console';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { Command } from 'commander';
import { blueBright, greenBright, magentaBright, redBright, yellowBright } from 'chalk';

import { description, version } from '../../package.json';

import ModUpdater, {
    ErrorEnum,
    type ErrorType,
    EventEnum,
    type ModInfo,
    type ModUpdateStatus,
    type Parameter
} from '../index';

const command: Command = new Command('mcmu');
const program: Command = command.description(description).version(version);

program.option('-i, --file <path>', 'path to the manifest file', join(resolve('.'), './manifest.json'));
program.option('-o, --outDir <path>', 'path to the output', resolve('.'));
program.option('-k, --apiKey <text>', 'api key', env['MCMU_APIKEY'] ?? 'none');
program.option('-f, --forceDownload', 'force download', false);

program.parse(argv);

const { file, outDir, apiKey, forceDownload }: Parameter = program.opts<Parameter>();

if (apiKey !== 'none') {
    if (existsSync(file)) {
        const modUpdater: ModUpdater = new ModUpdater(file, {
            outDir,
            apiKey,
            forceDownload
        });
        modUpdater.addEventListener<ModInfo>(EventEnum.DOWNLOADING, (mod: ModInfo): void => info(`${magentaBright('Downloading:')} ${blueBright(mod.fileName)} {(${yellowBright(mod.modId)}) [${redBright(mod.fileID)} => ${greenBright(mod.id)}]} -> ${blueBright(mod.downloadUrl)}`));
        modUpdater.addEventListener<ModInfo>(EventEnum.DOWNLOADED, (mod: ModInfo): void => info(`${greenBright('The download is complete')}: ${blueBright(mod.fileName)}\n`));
        modUpdater.addEventListener<ModInfo>(EventEnum.SKIPPED, (mod: ModInfo): void => warn(`${greenBright('Already the latest version, the update has been skipped')}: ${blueBright(mod.fileName)} (${yellowBright(mod.modId)} [${greenBright(mod.fileID)} == ${greenBright(mod.id)}]) \n`));
        modUpdater.addEventListener<ModUpdateStatus>(EventEnum.FINISHED, (mod: ModUpdateStatus): void => info(mod, '\n', greenBright('The update is complete')));
        modUpdater.addEventListener<ErrorType<ModInfo>>(EventEnum.ERRORED, ({ type, mod }: ErrorType<ModInfo>): void => {
            switch (type) {
            case ErrorEnum.ADDRESS:
                error(`${redBright('=====Error: Unable to get file address, please download it manually=====')}\nMod ID: ${yellowBright(mod.modId)}\nThe name of the mod file: ${magentaBright(mod.fileName)}\n`);
                break;
            case ErrorEnum.DOWNLOAD:
                error(`${redBright('=====Error: Unable to download the file, please download it manually=====')}\nMod ID: ${yellowBright(mod.modId)}\nThe name of the mod file: ${magentaBright(mod.fileName)}\n`);
                break;
            }
        });
    } else {
        error(redBright('The manifest.json file does not exist, please create it and try again alive to view the help with mcmu -h'));
    }
} else {
    warn(yellowBright('The MCMU_APIKEY system environment variable could not be found, please add the system environment variable and try again alive to view the help with mcmu -h'));
}
