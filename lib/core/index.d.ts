import { type Callback, type Config, type Event, type FilesInfo, type FilesStatus, type ManifestFormat, type ModFormat, type ModInfo, type ModLoader } from '../interfaces';
declare class ModsUpdater {
    private readonly event;
    private readonly manifestInfo;
    private readonly mods;
    private readonly instance;
    private readonly manifest;
    private readonly filesStatus;
    constructor(filePath: string, config: Config);
    addListener<T>(event: Event, callback: Callback<T>): void;
    private update;
    private downloadFile;
    private createFile;
    private writeManifest;
}
export default ModsUpdater;
export type { Callback, Config, Event, ManifestFormat, FilesInfo, FilesStatus, ModLoader, ModFormat, ModInfo };
//# sourceMappingURL=index.d.ts.map