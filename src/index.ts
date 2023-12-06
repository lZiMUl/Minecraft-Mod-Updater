import {argv} from 'node:process';
import {error, info, warn} from 'node:console';
import {blueBright, greenBright, magentaBright, redBright, yellowBright} from 'chalk';
import ModUpdate, {FilesInfo, ModInfo} from "./core/index";

const modUpdate: ModUpdate = new ModUpdate(argv.slice(2)[0], {
    // Get the key in https://console.curseforge.com/?#/api-keys
    api: ''
});

modUpdate.addListener<ModInfo>('download', (mods: ModInfo): void => info(`${magentaBright('Downloading:')} ${blueBright(mods.fileName)} {(${yellowBright(mods.modId)}) [${redBright(mods.fileID)} => ${greenBright(mods.id)}]} -> ${blueBright(mods.downloadUrl)}`));
modUpdate.addListener<ModInfo>('downloaded', (mods: ModInfo): void => info(`${greenBright('The download is complete')}: ${blueBright(mods.fileName)}\n`));
modUpdate.addListener<ModInfo>('skipped', (mods: ModInfo): void => warn(`${greenBright('Already the latest version, the update has been skipped')}: ${blueBright(mods.fileName)} (${yellowBright(mods.modId)} [${greenBright(mods.fileID)} == ${greenBright(mods.id)}]) \n`));
modUpdate.addListener<FilesInfo>('done', (mods: FilesInfo): void => info(mods, '\n', greenBright('The update is complete')));
modUpdate.addListener<ModInfo>('error', (mods: ModInfo): void => error(`${redBright('=====Error: Unable to get file address, please download it manually=====')}\nMod ID: ${yellowBright(mods.modId)}\nThe name of the mod file: ${magentaBright(mods.fileName)}\n`));
