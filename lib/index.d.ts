import { type Callback, type Config, type Event, type ForgeResponseData, type ManifestFormat, type ModFormat, type ModInfo, type ModLoader, type ModUpdateStatus } from './interfaces';
declare class ModUpdater {
    private readonly event;
    private readonly manifestInfo;
    private readonly modList;
    private readonly instance;
    private readonly manifest;
    private readonly modStatus;
    constructor(filePath: string, config: Config);
    private get nextModMetaInfo();
    addListener<T>(event: Event, callback: Callback<T>): void;
    private update;
    private createFile;
    private downloadFile;
    private writeModStatus;
}
export default ModUpdater;
export type { Callback, Config, Event, ManifestFormat, ForgeResponseData, ModUpdateStatus, ModLoader, ModFormat, ModInfo };
//# sourceMappingURL=index.d.ts.map