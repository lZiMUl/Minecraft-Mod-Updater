/// <reference types="node" />
import { EventEmitter } from 'node:events';
import { type Callback, type Config, ErrorEnum, type ErrorType, EventEnum, type ForgeResponseData, type ManifestFormat, type ModFormat, type ModInfo, type ModLoader, type ModUpdateStatus, type Parameter } from './interfaces';
import { Args, Size } from './interfaces/gui';
declare class ModManifestUpdater extends EventEmitter {
    private readonly manifestInfo;
    private readonly modList;
    private readonly instance;
    private readonly manifest;
    private readonly modStatus;
    constructor(filePath: string, config: Config);
    private get nextModMetaInfo();
    addEventListener<T = ModInfo | ModUpdateStatus | ErrorType<ModInfo | ModUpdateStatus>>(event: EventEnum, callback: Callback<T>): void;
    private createFile;
    private downloadFile;
    private writeModStatus;
}
export default ModManifestUpdater;
export { ModManifestUpdater, ErrorEnum, EventEnum };
export type { Callback, Config, ManifestFormat, ForgeResponseData, ModUpdateStatus, ModLoader, ModFormat, ModInfo, ErrorType, Parameter, Args, Size };
//# sourceMappingURL=modManifestUpdater.d.ts.map