/// <reference types="node" />
import { EventEmitter } from 'node:events';
import type { ManifestFormat, ModInfo } from './interfaces';
import { EventNameEnum } from './interfaces';
type e = () => void;
type e1 = (mod: ModInfo) => void;
type CallbackResult = e | e1;
declare class ModJarFileUpdater extends EventEmitter {
    private curseForge;
    private modFileList;
    static fakeModManifestFile: ManifestFormat;
    constructor(path: string);
    addEventListener(eventName: EventNameEnum, listener: CallbackResult): void;
    private get getNextModInfo();
}
export default ModJarFileUpdater;
//# sourceMappingURL=modJarFileUpdater.d.ts.map