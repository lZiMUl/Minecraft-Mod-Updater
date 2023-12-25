import { Callback, Config, Event, FilesFormat, FilesInfo, ModFormat, ModInfo } from '../interfaces';
declare class UpdateMods {
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
export default UpdateMods;
export type { FilesFormat, ModFormat, ModInfo, FilesInfo, Event, Callback };
//# sourceMappingURL=index.d.ts.map