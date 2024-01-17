import { join } from 'node:path';
import { EventEmitter } from 'node:events';
import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync, type WriteStream } from 'node:fs';
import { type AxiosInstance, type AxiosResponse, create, request } from 'axios';
import { exit } from 'node:process';

import {
    type Callback,
    type Config,
    ErrorEnum,
    type Event,
    type ForgeResponseData,
    type ManifestFormat,
    type ModFormat,
    type ModInfo,
    type ModLoader,
    type ModUpdateStatus
} from './interfaces';

class ModUpdater {
    private readonly event: EventEmitter = new EventEmitter();
    private readonly manifestInfo: ManifestFormat;
    private readonly modList: ModFormat[];
    private readonly instance: AxiosInstance;
    private readonly manifest: ManifestFormat;
    private readonly modStatus: ModUpdateStatus = {
        'succeed': [],
        'fail': []
    };
    /**
     * @name ModUpdater
     * @description Call this class to start customizing your secondary development project
     * @version 1.2.17
     * @author lZiMUl <lZiMUl@lzimul.top>
     * @licence GPL-3.0
     * @param { string } filePath The path to the list of mods
     * @param { Config } config Configuration items
     * @param { Config.outDir } config.outDir The output path of the module
     * @param { Config.apiKey } config.apiKey CurseForge Developer Platform Personal Key
     * @param { Config.forceDownload } config.forceDownload Whether to enable forced downloads
     * @return { ModUpdater } ModUpdater Class
     * @example
     * const modUpdater: ModUpdater = new ModUpdater('./manifest.json', {
     *   outDir: './',
     *   apiKey: 'xxxxxxxxxxxxxxxxxxxxx',
     *   forceDownload: true
     * })
     */
    public constructor(filePath: string, config: Config) {
        this.manifestInfo = JSON.parse(readFileSync(filePath, {
            'encoding': 'utf-8',
            'flag': 'r'
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
        this.modList = [ ...new Set(this.manifestInfo.files.map(({
            projectID,
            fileID,
            required
        }: ModFormat): ModFormat => ({
            projectID, fileID, required
        }))) ];
        this.update(config);
        this.event.emit('getNextModInfo', this.nextModMetaInfo);
    }

    private get nextModMetaInfo(): ModFormat | void {
        return this.modList.shift();
    }
    /**
     * @name addListener
     * @description Add an event listener to process subsequent results
     * @version 1.2.17
     * @author lZiMUl <lZiMUl@lzimul.top>
     * @licence GPL-3.0
     * @public 1 1
     * @param { Event } event EventName
     * @param { Callback<ModInfo | ModUpdateStatus | ErrorCallback<ModInfo>> } callback CallBack Function
     * @return { void } void
     * @example
     * modUpdater.addListener<ModInfo>('downloading', (message: string) => {
     *     console.info(message);
     * });
     */
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
                if (this.modList.length && projectID && fileID) {
                    const { data }: AxiosResponse<ForgeResponseData> = await this.instance.request({
                        'url': `${projectID}/files`,
                    });
                    const mod: ModInfo = Object.assign({ fileID }, data.data[0]);
                    if (mod.id !== fileID || config.forceDownload) {
                        if (mod.downloadUrl) {
                            this.event.emit('downloading', mod);
                            await this.downloadFile(mod, join(config.outDir, 'Minecraft Mod Update'));
                        } else {
                            this.event.emit('errored', { 'type': ErrorEnum.ADDRESS, mod });
                            this.writeModStatus(mod, false);
                            this.event.emit('getNextModInfo', this.nextModMetaInfo);
                        }
                    } else {
                        this.event.emit('skipped', mod);
                        this.writeModStatus(mod, true);
                        this.event.emit('getNextModInfo', this.nextModMetaInfo);
                    }
                } else {
                    writeFileSync(join(config.outDir, 'new.manifest.json'), JSON.stringify(this.manifest, null, 2));
                    writeFileSync(join(config.outDir, 'Minecraft Mod Update Status.json'), JSON.stringify(this.modStatus, null, 2));
                    this.event.emit('finished', this.modStatus);
                    exit(0);
                }
            }
        });
    }

    private createFile(fileName: string, path: string): WriteStream {
        if (!existsSync(path)) {
            mkdirSync(path, { 'recursive': true });
        }
        return createWriteStream(join(path, fileName));
    }

    private async downloadFile(mod: ModInfo, path: string): Promise<void> {
        const { data }: AxiosResponse<WriteStream> = await request({
            'url': mod.downloadUrl,
            'responseType': 'stream'
        });
        data.pipe<WriteStream>(this.createFile(mod.fileName, path))
            .addListener('finish', (): void => {
                this.writeModStatus(mod, true);
                this.event.emit('downloaded', mod);
                this.event.emit('getNextModInfo', this.nextModMetaInfo);
            }).addListener('error', (): void => {
                this.writeModStatus(mod, false);
                this.event.emit('errored', { 'type': ErrorEnum.DOWNLOAD, mod });
                this.event.emit('getNextModInfo', this.nextModMetaInfo);
            });
    }

    private writeModStatus(mod: ModInfo, status: boolean): void {
        const modInfo: ModFormat = {
            'projectID': mod.modId,
            'fileID': mod.id,
            'required': this.manifestInfo.files.find((modMetaInfo: ModFormat): ModFormat | void => {
                if (modMetaInfo.projectID === mod.modId) {
                    return modMetaInfo;
                }
            })?.required ?? false
        };
        if (status) {
            this.manifest.files.push(modInfo);
            this.modStatus.succeed.push(modInfo);
        } else if (!status && modInfo.projectID && modInfo.fileID) {
            this.modStatus.fail.push(modInfo);
        }
    }
}

export default ModUpdater;
export { ModUpdater };
export type {
    Callback,
    Config,
    Event,
    ManifestFormat,
    ForgeResponseData,
    ModUpdateStatus,
    ModLoader,
    ModFormat,
    ModInfo
};
