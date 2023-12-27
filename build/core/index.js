"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = require("node:path");
const node_events_1 = require("node:events");
const node_fs_1 = require("node:fs");
const axios_1 = require("axios");
const node_process_1 = require("node:process");
class ModsUpdater {
    event = new node_events_1.EventEmitter();
    manifestInfo;
    mods;
    instance;
    manifest;
    filesStatus = {
        'succeed': [],
        'fail': []
    };
    constructor(filePath, config) {
        this.manifestInfo = JSON.parse((0, node_fs_1.readFileSync)(filePath, {
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
        this.manifestInfo.minecraft.modLoaders.forEach((item) => this.manifest.minecraft.modLoaders.push(item));
        this.instance = (0, axios_1.create)({
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
        this.mods = [...new Set(this.manifestInfo.files.map(({ projectID, fileID, required }) => ({
                projectID, fileID, required
            })))];
        this.update(config);
        this.event.emit('getNextModInfo', this.mods.shift());
    }
    addListener(event, callback) {
        this.event.addListener(event, callback);
    }
    update(config) {
        this.event.addListener('getNextModInfo', async ({ projectID, fileID, required }) => {
            if (required) {
                if (this.mods.length && projectID && fileID) {
                    const { data } = await this.instance.request({
                        'url': `${projectID}/files`,
                    });
                    const mods = Object.assign({ fileID }, data.data[0]);
                    if (mods.id !== fileID || config.forceDownload) {
                        if (mods.downloadUrl) {
                            this.event.emit('downloading', mods);
                            await this.downloadFile(mods, (0, node_path_1.join)(config.outDir, 'MinecraftModsUpdate'));
                        }
                        else {
                            this.event.emit('errored', mods);
                            this.writeManifest(mods, false);
                            this.event.emit('getNextModInfo', this.mods.shift());
                        }
                    }
                    else {
                        this.event.emit('skipped', mods);
                        this.writeManifest(mods, true);
                        this.event.emit('getNextModInfo', this.mods.shift());
                    }
                }
                else {
                    (0, node_fs_1.writeFileSync)('new.manifest.json', JSON.stringify(this.manifest, null, 2));
                    (0, node_fs_1.writeFileSync)('MinecraftModsUpdate.json', JSON.stringify(this.filesStatus, null, 2));
                    this.event.emit('finished', this.filesStatus);
                    (0, node_process_1.exit)(0);
                }
            }
        });
    }
    async downloadFile(mods, path) {
        const { data } = await (0, axios_1.request)({
            'url': mods.downloadUrl,
            'responseType': 'stream'
        });
        data.pipe(this.createFile(mods.fileName, path));
        this.writeManifest(mods, true);
        this.event.emit('downloaded', mods);
        this.event.emit('getNextModInfo', this.mods.shift());
    }
    createFile(fileName, path) {
        if (!(0, node_fs_1.existsSync)(path)) {
            (0, node_fs_1.mkdirSync)(path);
        }
        return (0, node_fs_1.createWriteStream)((0, node_path_1.join)(path, fileName));
    }
    writeManifest(mods, status) {
        const modsInfo = {
            'projectID': mods.modId,
            'fileID': mods.id,
            'required': this.manifestInfo.files.find((modMetaInfo) => {
                if (modMetaInfo.projectID === mods.modId) {
                    return modMetaInfo;
                }
            })?.required ?? false
        };
        if (status) {
            this.manifest.files.push(modsInfo);
            this.filesStatus.succeed.push(modsInfo);
        }
        else if (!status && modsInfo.projectID && modsInfo.fileID) {
            this.filesStatus.fail.push(modsInfo);
        }
    }
}
exports.default = ModsUpdater;
