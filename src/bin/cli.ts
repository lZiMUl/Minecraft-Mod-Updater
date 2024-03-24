#!/usr/bin/env node
import { argv, env } from 'node:process';
import { error, info, warn } from 'node:console';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { Command } from 'commander';
import { blueBright, greenBright, magentaBright, redBright, yellowBright } from 'chalk';

import packageFile from '../../package.json';

import { ModJarFileUpdater, ModManifestUpdater } from '../index';
import { Parameter, EventEnum, ErrorEnum, ErrorType, type ModInfo, type ModUpdateStatus } from '../index';
import { EventNameEnum } from '../interfaces';

const command: Command = new Command('mcmu');
const program: Command = command.description(packageFile.description);

program.option('-t, --type <JarFile | Manifest>', 'read type is jarFile or manifest', 'JarFile');
program.option('-i, --input <path>', 'path to the input', join(resolve('.'), './manifest.json'));
program.option('-o, --output <path>', 'path to the output', resolve('.'));
program.option('-v, --version <string>', 'game version');
program.option('-l, --loader <forge | fabric | neoforge>', 'mod loader platform');
program.option('-k, --apiKey <text>', 'api key', env['MCMU_APIKEY'] ?? 'none');
program.option('-f, --forceDownload', 'force download', false);

program.parse(argv);

const { type, input, output, version, loader, apiKey, forceDownload }: Parameter = program.opts<Parameter>();

function manifest(input: string, forceDownload: boolean): void {
    if (existsSync(input)) {
        const modUpdater: ModManifestUpdater = new ModManifestUpdater(input, {
            output,
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
}

function jarFile(input: string): void {
    const dirPath: string = input.includes('json') ? resolve('./mods'): input;
    if (existsSync(dirPath)) {
        if (!version) {
            error(redBright('The version is not specified, please specify it and try again alive to view the help with mcmu -h'));
            return;
        }
        if (!loader) {
            error(redBright('The modLoader is not specified, please specify it and try again alive to view the help with mcmu -h'));
            return;
        }
        ModJarFileUpdater.fakeModManifestFile.minecraft.version = version;
        ModJarFileUpdater.fakeModManifestFile.minecraft.modLoaders.push({
            'id':  loader,
            'primary': true
        });
        const modJarFileUpdater: ModJarFileUpdater = new ModJarFileUpdater(dirPath);
        modJarFileUpdater.addEventListener(EventNameEnum.INIT, (mod: ModInfo): void => info(`${magentaBright('Init:')} ${blueBright(mod.fileName)} (${yellowBright(mod.modId)})`));
        modJarFileUpdater.addEventListener(EventNameEnum.FINISHED, (): void => {
            manifest(join(resolve('.'), './temp.json'), true);
        });
    } else {
        error(redBright('The mods dir does not exist, please create it and try again alive to view the help with mcmu -h'));
    }
}

if (apiKey !== 'none') {
    switch (type) {
    case 'Manifest':
        manifest(input, forceDownload);
        break;
    case 'JarFile':
        jarFile(input);
        break;
    default:
        error(redBright('The read type is incorrect, please try again alive to view the help with mcmu -h'));
    }

} else {
    warn(yellowBright('The MCMU_APIKEY system environment variable could not be found, please add the system environment variable and try again alive to view the help with mcmu -h'));
}
