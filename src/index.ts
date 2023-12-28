#!/usr/bin/env node
import { argv, env } from 'node:process';
import { error, info, warn } from 'node:console';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { Command } from 'commander';
import { blueBright, greenBright, magentaBright, redBright, yellowBright } from 'chalk';

import { description, version } from '../package.json';
import ModsUpdater, { ModInfo, ModUpdateStatus } from './core/index';
import { Parameter } from './interfaces';

const command: Command = new Command('mcmu');
const program: Command = command.description(description).version(version);

program.option('-mp, --manifestPath <path>', 'path to the manifest file', join(resolve('.'), './manifest.json'));
program.option('-od, --outDir <path>', 'path to the output', resolve('.'));
program.option('-ak, --apiKey <text>', 'api key', env.MCMU_APIKEY ?? 'none');
program.option('-fd, --forceDownload', 'force download', false);

program.parse(argv);

const { manifestPath, outDir, apiKey, forceDownload }: Parameter = program.opts<Parameter>();

if (apiKey !== 'none') {
    if (existsSync(manifestPath)) {
        const modUpdate: ModsUpdater = new ModsUpdater(manifestPath, {
            outDir,
            apiKey,
            forceDownload
        });
        modUpdate.addListener<ModInfo>('downloading', (mods: ModInfo): void => info(`${magentaBright('Downloading:')} ${blueBright(mods.fileName)} {(${yellowBright(mods.modId)}) [${redBright(mods.fileID)} => ${greenBright(mods.id)}]} -> ${blueBright(mods.downloadUrl)}`));
        modUpdate.addListener<ModInfo>('downloaded', (mods: ModInfo): void => info(`${greenBright('The download is complete')}: ${blueBright(mods.fileName)}\n`));
        modUpdate.addListener<ModInfo>('skipped', (mods: ModInfo): void => warn(`${greenBright('Already the latest version, the update has been skipped')}: ${blueBright(mods.fileName)} (${yellowBright(mods.modId)} [${greenBright(mods.fileID)} == ${greenBright(mods.id)}]) \n`));
        modUpdate.addListener<ModUpdateStatus>('finished', (mods: ModUpdateStatus): void => info(mods, '\n', greenBright('The update is complete')));
        modUpdate.addListener<ModInfo>('errored', (mods: ModInfo): void => error(`${redBright('=====Error: Unable to get file address, please download it manually=====')}\nMod ID: ${yellowBright(mods.modId)}\nThe name of the mod file: ${magentaBright(mods.fileName)}\n`));
    } else {
        error(redBright('The manifest.json file does not exist, please create it and try again alive to view the help with mcmu -h'));
    }
} else {
    warn(yellowBright('The MCMU_APIKEY system environment variable could not be found, please add the system environment variable and try again alive to view the help with mcmu -h'));
}
