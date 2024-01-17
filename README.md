# Minecraft Mod Updater
### A Minecraft mod update tool based on Node.js
# Use it directly
## Installation
### Using npm
```bash
npm install -g minecraft-mod-updater
```
## Command
### CLI (Command aliases)
```bash
minecraft-mod-updater-cli
mcmu-cli
mcmuc
```
### GUI (Command aliases)
```bash
minecraft-mod-updater-gui
mcmu-gui
mcmug
```
## Example
### CLI (Parameters are optional)
```bash
mcmuc -h
mcmuc -i "./MyModPack/manifest.json" -o "./MyModPack" -k "xxxxxxxxxxxxxxxxxxxxxx" -f
```
### GUI (Parameters are optional)
```bash
mcmug -h
mcmug -i "./MyModPack/manifest.json" -o "./MyModPack" -k "xxxxxxxxxxxxxxxxxxxxxx" -f
````
## Parameter (General parameters)
```text
Options:
  -V, --version             output the version number
  -i, --file <path>         path to the manifest file
  -o, --outDir <path>       path to the output
  -k, --apiKey <text>       api key
  -f, --forceDownload       force download
  -h, --help                display help for command
```
# Secondary development
### If you need to do secondary development, use the following command:
## Installation
### Using npm
```bash
npm install --save minecraft-mod-updater
```
## Example

```ts
import ModUpdater, { type ModInfo, type ModUpdateStatus, ErrorEnum, type ErrorType, type Parameter } from 'minecraft-mod-updater';
import { blueBright, greenBright, magentaBright, redBright, yellowBright } from 'chalk';

const modUpdater: ModUpdater = new ModUpdater('./filePath/manifest.json', {
    outDir: './out',
    apiKey: 'xxxxxxxxxxxxxxxxxxxxxxxx',
    forceDownload: false
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
```