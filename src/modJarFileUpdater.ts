import { EventEmitter } from 'node:events';
import { readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { env } from 'node:process';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { parse } from 'toml';

import Jar from './jar';
import type { ManifestFormat, ModInfo } from './interfaces';
import { EventNameEnum } from './interfaces';

interface Temp<T> {
    modId: T;
    displayName: T;
}

type e = () => void
type e1 = (mod: ModInfo) => void

type CallbackResult =  e | e1;

class ModJarFileUpdater extends EventEmitter {
    private curseForge: AxiosInstance = axios.create({
        'baseURL': 'https://api.curseforge.com/v1/mods/search',
        'method': 'GET',
        'params': {
            'gameId': 432,
        },
        'headers': {
            'Accept': 'application/json',
            'x-api-key': env.MCMU_APIKEY
        }
    });

    private modFileList: string[];
    public static fakeModManifestFile: ManifestFormat = {
        'minecraft': {
            'version': '',
            'modLoaders': []
        },
        'manifestType': '',
        'manifestVersion': 0,
        'name': '',
        'version': '',
        'author': '',
        'files': [],
        'overrides': '',
    };

    public constructor(path: string) {
        super();
        this.modFileList = readdirSync(path);
        super.addListener('getNextModInfo', async (modInfo): Promise<void> => {
            if (this.modFileList.length) {
                try {
                    const { modId, displayName }: Temp<string> = parse(await modInfo).mods[0];
                    super.emit(EventNameEnum.INIT, { modId, 'fileName': displayName });
                    const result: AxiosResponse = await this.curseForge.request({
                        'params': {
                            'searchFilter': modId,
                            'gameVersion': ModJarFileUpdater.fakeModManifestFile.version,
                            'modLoaderTypes': ModJarFileUpdater.fakeModManifestFile.minecraft.modLoaders[0].id
                        }
                    });
                    ModJarFileUpdater.fakeModManifestFile.files.push({
                        'projectID': result.data.data[0].id,
                        'fileID': 93293583,
                        'required': true
                    });
                    super.emit('getNextModInfo', this.getNextModInfo);
                } catch (err) {
                    super.emit('getNextModInfo', this.getNextModInfo);
                }
            } else {
                writeFileSync(join(resolve('.'), './temp.json'), JSON.stringify(ModJarFileUpdater.fakeModManifestFile, null, 2));
                super.emit(EventNameEnum.FINISHED);
            }
        });
        super.emit('getNextModInfo', this.getNextModInfo);
    }

    public addEventListener(eventName: EventNameEnum, listener: CallbackResult): void {
        super.addListener(eventName, listener);
    }

    private get getNextModInfo(): Promise<Buffer> {
        const file: string = this.modFileList.shift() as string;
        if (file.includes('.jar')) {
            const jar: Jar = new Jar(file);
            return jar.readFile('META-INF/mods.toml');
        }
        return this.getNextModInfo;
    }
}

export default ModJarFileUpdater;