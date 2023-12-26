import { join } from 'node:path';
import { EventEmitter } from 'node:events';
import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync, type WriteStream } from 'node:fs';
import { type AxiosInstance, type AxiosResponse, create, request } from 'axios';
import { exit } from 'node:process';

import {
    type Callback,
    type Config,
    type Event,
    type FilesFormat,
    type FilesInfo,
    type ModFormat,
    type ModInfo
} from '../interfaces';

class ModsUpdater {
    private readonly event: EventEmitter = new EventEmitter();
    private readonly modInfo: FilesFormat;
    private readonly mods: ModFormat[];
    private readonly instance: AxiosInstance;
    private filesData: FilesInfo = {
        'succeed': [],
        'fail': []
    };

    public constructor(filePath: string, config: Config) {
        this.instance = create({
            'baseURL': 'https://api.curseforge.com/v1/mods',
            'method': 'GET',
            'params': {
                'gameVersion': '1.20.1',
                'modLoaderType': 1
            },
            'headers': {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'x-api-key': config.apiKey
            }
        });

        this.modInfo = JSON.parse(readFileSync(filePath, {
            'encoding': 'utf-8'
        }));
        this.mods = [ ...new Set(this.modInfo.files.map(({ projectID, fileID, required }: ModFormat): ModFormat => ({
            projectID, fileID, required
        }))) ];
        this.update(config);
        this.event.emit('getNextModInfo', this.mods.shift());
    }

    public addListener<T>(event: Event, callback: Callback<T>): void {
        this.event.addListener(event, callback);
    }

    private update(config: Config): void {
        this.event.addListener('getNextModInfo', async ({
            projectID,
            fileID,
            required
        }: ModFormat): Promise<void> => {
            if (required) {
                if (this.mods.length && projectID && fileID) {
                    const { data }: AxiosResponse<FilesFormat> = await this.instance.request({
                        'url': `${projectID}/files`,
                    });
                    const mods: ModInfo = Object.assign({ fileID }, data.data[0]);
                    if (mods.id !== fileID || config.forceDownload) {
                        if (mods.downloadUrl) {
                            this.event.emit('downloading', mods);
                            await this.downloadFile(mods, join(config.outDir, 'MinecraftModsUpdate'));
                        } else {
                            this.event.emit('errored', mods);
                            this.writeManifest(mods, false);
                            this.event.emit('getNextModInfo', this.mods.shift());
                        }
                    } else {
                        this.event.emit('skipped', mods);
                        this.writeManifest(mods, true);
                        this.event.emit('getNextModInfo', this.mods.shift());
                    }
                } else {
                    writeFileSync('MinecraftModsUpdate.json', JSON.stringify(this.filesData, null, 2));
                    this.event.emit('finished', this.filesData);
                    exit(0);
                }
            }
        });
    }

    private async downloadFile(mods: ModInfo, path: string): Promise<void> {
        const { data }: AxiosResponse<WriteStream> = await request({
            'url': mods.downloadUrl,
            'responseType': 'stream'
        });
        data.pipe(this.createFile(mods.fileName, path));
        this.writeManifest(mods, true);
        this.event.emit('downloaded', mods);
        this.event.emit('getNextModInfo', this.mods.shift());
    }

    private createFile(fileName: string, path: string): WriteStream {
        if (!existsSync(path)) {
            mkdirSync(path);
        }
        return createWriteStream(join(path, fileName));
    }

    private writeManifest(mods: ModInfo, status: boolean): void {
        const modsInfo: ModFormat = {
            'projectID': mods.modId,
            'fileID': mods.id,
            'required': true
        };
        if (status) {
            this.filesData.succeed.push(modsInfo);
        } else if (!status && modsInfo.projectID && modsInfo.fileID){
            this.filesData.fail.push(modsInfo);
        }
    }
}

export default ModsUpdater;
export type { FilesFormat, ModFormat, ModInfo, FilesInfo, Event, Callback };
