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
mcmuc -t Manifest -i "./MyModPack/manifest.json" -o "./MyModPack" -k "xxxxxxxxxxxxxxxxxxxxxx" -f
mcmuc -t JarFile -i "./MyModPack/mods" -o "./MyModPack" -v 1.20.1 -l forge -k "xxxxxxxxxxxxxxxxxxxxxx" -f
```
### GUI (Parameters are optional)
```bash
mcmug -h
mcmuc -t Manifest -i "./MyModPack/manifest.json" -o "./MyModPack" -k "xxxxxxxxxxxxxxxxxxxxxx" -f
mcmuc -t JarFile -i "./MyModPack/mods" -o "./MyModPack" -v 1.20.1 -l forge -k "xxxxxxxxxxxxxxxxxxxxxx" -f
````
## Parameter (General parameters)
```text
  -t, --type <JarFile | Manifest>            read type is jarFile or manifest
  -i, --input <path>                         path to the input
  -o, --output <path>                        path to the output
  -v, --version <string>                     game version
  -l, --loader <forge | fabric | neoforge>   mod loader platform
  -k, --apiKey <text>                        api key
  -f, --forceDownload                        force download
  -h, --help                                 display help for command
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
import {
    ModJarFileUpdater,
    ModManifestUpdater,
    type ModInfo,
    type ModUpdateStatus,
    ErrorEnum,
    type ErrorType,
    type Parameter
} from 'minecraft-mod-updater';
import {blueBright, greenBright, magentaBright, redBright, yellowBright} from 'chalk';

// Manifest Mode
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

// JarFile Mode
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

```