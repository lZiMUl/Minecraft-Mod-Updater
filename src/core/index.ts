import {join} from 'node:path';
import {EventEmitter} from 'node:events';
import {createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync, WriteStream} from 'node:fs';
import {AxiosInstance, AxiosResponse, create, request} from 'axios';
import {exit} from 'node:process';

import {Callback, Config, Event, FilesFormat, FilesInfo, ModFormat, ModInfo} from '../interfaces'

class UpdateMods {
    private readonly event: EventEmitter = new EventEmitter();
    private readonly modInfo: FilesFormat;
    private readonly mods: ModFormat[];
    private readonly instance: AxiosInstance;
    private filesData: FilesInfo = {
        succeed: [],
        fail: []
    };

    public constructor(filePath: string, config: Config) {
        this.instance = create({
            baseURL: 'https://api.curseforge.com/v1/mods',
            method: 'GET',
            params: {
                gameVersion: '1.20.1',
                modLoaderType: 1
            },
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'x-api-key': config.apiKey
            }
        });

        this.modInfo = JSON.parse(readFileSync(filePath, {
            encoding: 'utf-8'
        }));
        this.mods = [...new Set(this.modInfo.files.map(({projectID, fileID, required}: ModFormat): ModFormat => ({
            projectID, fileID, required
        })))];
        this.update(config);
    }

    public addListener<T>(event: Event, callback: Callback<T>): void {
        this.event.addListener(event, callback)
    }

    private update(config: Config, {
        projectID,
        fileID,
        required
    }: ModFormat = this.mods.shift() as ModFormat): void {
        if (required) {
            setTimeout(async (): Promise<void> => {
                if (this.mods.length && projectID && fileID) {
                    const {data}: AxiosResponse<FilesFormat> = await this.instance.request({
                        url: `${projectID}/files`,
                    });
                    let mods: ModInfo = Object.assign({fileID}, data.data[0]);
                    if (mods.id !== fileID || config.forceDownload) {
                        if (mods.downloadUrl) {
                            this.event.emit('download', mods);
                            await this.downloadFile(mods, join(config.outDir, 'MinecraftModsUpdate'), config);
                        } else {
                            this.event.emit('error', mods);
                            this.writeManifest(mods, false);
                            this.update(config);
                        }
                    } else {
                        this.event.emit('skipped', mods);
                        this.writeManifest(mods, true);
                        this.update(config);
                    }
                } else {
                    writeFileSync('MinecraftModsUpdate.json', JSON.stringify(this.filesData, null, 2))
                    this.event.emit('done', this.filesData);
                    exit(0);
                }
            }, 5000);
        }
    }

    private async downloadFile(mods: ModInfo, path: string, config: Config): Promise<void> {
        const {data}: AxiosResponse<WriteStream> = await request({
            url: mods.downloadUrl,
            responseType: 'stream'
        });
        data.pipe(this.createFile(mods.fileName, path));
        this.writeManifest(mods, true);
        this.event.emit('downloaded', mods);
        this.update(config);
    }

    private createFile(fileName: string, path: string): WriteStream {
        if (!existsSync(path)) mkdirSync(path);
        return createWriteStream(join(path, fileName));
    }

    private writeManifest(mods: ModInfo, status: boolean): void {
        const modsInfo: ModFormat = {
            projectID: mods.modId,
            fileID: mods.id,
            required: true
        };
        if (status) this.filesData.succeed.push(modsInfo);
        else this.filesData.fail.push(modsInfo)
    }
}

export default UpdateMods;
export type {FilesFormat, ModFormat, ModInfo, FilesInfo, Event, Callback};