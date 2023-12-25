"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = require("node:path");
const node_events_1 = require("node:events");
const node_fs_1 = require("node:fs");
const axios_1 = require("axios");
const node_process_1 = require("node:process");
class UpdateMods {
    event = new node_events_1.EventEmitter();
    modInfo;
    mods;
    instance;
    filesData = {
        succeed: [],
        fail: []
    };
    constructor(filePath, config) {
        this.instance = (0, axios_1.create)({
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
        this.modInfo = JSON.parse((0, node_fs_1.readFileSync)(filePath, {
            encoding: 'utf-8'
        }));
        this.mods = [...new Set(this.modInfo.files.map(({ projectID, fileID, required }) => ({
                projectID, fileID, required
            })))];
        this.update(config);
    }
    addListener(event, callback) {
        this.event.addListener(event, callback);
    }
    update(config, { projectID, fileID, required } = this.mods.shift()) {
        if (required) {
            setTimeout(async () => {
                if (this.mods.length && projectID && fileID) {
                    const { data } = await this.instance.request({
                        url: `${projectID}/files`,
                    });
                    let mods = Object.assign({ fileID }, data.data[0]);
                    if (mods.id !== fileID || config.forceDownload) {
                        if (mods.downloadUrl) {
                            this.event.emit('download', mods);
                            await this.downloadFile(mods, (0, node_path_1.join)(config.outDir, 'MinecraftModsUpdate'), config);
                        }
                        else {
                            this.event.emit('error', mods);
                            this.writeManifest(mods, false);
                            this.update(config);
                        }
                    }
                    else {
                        this.event.emit('skipped', mods);
                        this.writeManifest(mods, true);
                        this.update(config);
                    }
                }
                else {
                    (0, node_fs_1.writeFileSync)('MinecraftModsUpdate.json', JSON.stringify(this.filesData, null, 2));
                    this.event.emit('done', this.filesData);
                    (0, node_process_1.exit)(0);
                }
            }, 5000);
        }
    }
    async downloadFile(mods, path, config) {
        const { data } = await (0, axios_1.request)({
            url: mods.downloadUrl,
            responseType: 'stream'
        });
        data.pipe(this.createFile(mods.fileName, path));
        this.writeManifest(mods, true);
        this.event.emit('downloaded', mods);
        this.update(config);
    }
    createFile(fileName, path) {
        if (!(0, node_fs_1.existsSync)(path))
            (0, node_fs_1.mkdirSync)(path);
        return (0, node_fs_1.createWriteStream)((0, node_path_1.join)(path, fileName));
    }
    writeManifest(mods, status) {
        const modsInfo = {
            projectID: mods.modId,
            fileID: mods.id,
            required: true
        };
        if (status)
            this.filesData.succeed.push(modsInfo);
        else
            this.filesData.fail.push(modsInfo);
    }
}
exports.default = UpdateMods;
