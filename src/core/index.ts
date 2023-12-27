import { join } from 'node:path';
import { EventEmitter } from 'node:events';
import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync, type WriteStream } from 'node:fs';
import { type AxiosInstance, type AxiosResponse, create, request } from 'axios';
import { exit } from 'node:process';

import {
    type Callback,
    type Config,
    type Event,
    type FilesInfo,
    type FilesStatus,
    type ManifestFormat,
    type ModFormat,
    type ModInfo,
    type ModLoader
} from '../interfaces';

class ModsUpdater {
    private readonly event: EventEmitter = new EventEmitter();
    private readonly manifestInfo: ManifestFormat;
    private readonly mods: ModFormat[];
    private readonly instance: AxiosInstance;
    private readonly manifest: ManifestFormat;
    private readonly filesStatus: FilesStatus = {
        'succeed': [],
        'fail': []
    };

    public constructor(filePath: string, config: Config) {
        this.manifestInfo = JSON.parse(readFileSync(filePath, {
            'encoding': 'utf-8'
        }));
        this.manifest = {
            'minecraft': {
                'version': this.manifestInfo.minecraft.version,
                'modLoaders': []
            },
            'manifestType': this.manifestInfo.manifestType,
            'manifestVersion': this.manifestInfo.manifestVersion,
            'name': this.manifestInfo.name,
            'version': this.manifestInfo.version,
            'author': this.manifestInfo.author,
            'files': [],
            'overrides': this.manifestInfo.overrides,
        };
        this.manifestInfo.minecraft.modLoaders.forEach((item: ModLoader): number => this.manifest.minecraft.modLoaders.push(item));
        this.instance = create({
            'baseURL': 'https://api.curseforge.com/v1/mods',
            'method': 'GET',
            'params': {
                'gameVersion': this.manifestInfo.minecraft.version,
                'modLoaderType': 1
            },
            'headers': {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'x-api-key': config.apiKey
            }
        });
        this.mods = [ ...new Set(this.manifestInfo.files.map(({ projectID, fileID, required }: ModFormat): ModFormat => ({
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
                    const { data }: AxiosResponse<FilesInfo> = await this.instance.request({
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
                    writeFileSync('new.manifest.json', JSON.stringify(this.manifest, null, 2));
                    writeFileSync('MinecraftModsUpdate.json', JSON.stringify(this.filesStatus, null, 2));
                    this.event.emit('finished', this.filesStatus);
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
            'required': this.manifestInfo.files.find((modMetaInfo: ModFormat): ModFormat | void => {
                if (modMetaInfo.projectID === mods.modId) {
                    return modMetaInfo;
                }
            })?.required ?? false
        };
        if (status) {
            this.manifest.files.push(modsInfo);
            this.filesStatus.succeed.push(modsInfo);
        } else if (!status && modsInfo.projectID && modsInfo.fileID) {
            this.filesStatus.fail.push(modsInfo);
        }
    }
}

export default ModsUpdater;
export type {
    Callback,
    Config,
    Event,
    ManifestFormat,
    FilesInfo,
    FilesStatus,
    ModLoader,
    ModFormat,
    ModInfo
};
