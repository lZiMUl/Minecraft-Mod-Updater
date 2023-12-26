import { type Callback, type Config, type Event, type FilesFormat, type FilesInfo, type ModFormat, type ModInfo } from '../interfaces';
declare class ModsUpdater {
    private readonly event;
    private readonly modInfo;
    private readonly mods;
    private readonly instance;
    private filesData;
    constructor(filePath: string, config: Config);
    addListener<T>(event: Event, callback: Callback<T>): void;
    private update;
    private downloadFile;
    private createFile;
    private writeManifest;
}
export default ModsUpdater;
export type { FilesFormat, ModFormat, ModInfo, FilesInfo, Event, Callback };
//# sourceMappingURL=index.d.ts.map