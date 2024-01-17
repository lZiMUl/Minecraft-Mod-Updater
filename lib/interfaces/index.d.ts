declare enum ErrorEnum {
    ADDRESS = "ADDRESS",
    DOWNLOAD = "DOWNLOAD"
}
interface Config {
    outDir: string;
    apiKey: string;
    forceDownload: boolean;
}
interface Parameter extends Config {
    file: string;
}
interface ModFormat {
    projectID: number;
    fileID: number;
    required: boolean;
}
interface ModInfo extends ModFormat {
    id: number;
    modId: number;
    fileName: string;
    downloadUrl: string | undefined;
}
interface ModLoader {
    id: number;
    primary: boolean;
}
interface ModUpdateStatus {
    succeed: ModFormat[];
    fail: ModFormat[];
}
interface ManifestFormat {
    minecraft: {
        version: string;
        modLoaders: ModLoader[];
    };
    manifestType: string;
    manifestVersion: number;
    name: string;
    version: string;
    author: string;
    files: ModFormat[];
    overrides: string;
}
interface ForgeResponseData {
    data: ModInfo[];
}
interface ErrorType<T> {
    type: ErrorEnum;
    mod: T;
}
declare enum EventEnum {
    DOWNLOADING = "downloading",
    DOWNLOADED = "downloaded",
    SKIPPED = "skipped",
    FINISHED = "finished",
    ERRORED = "errored"
}
type Callback<T> = (data: T) => void;
export { ErrorEnum, EventEnum };
export type { Config, Parameter, ModFormat, ModInfo, ModLoader, ManifestFormat, ForgeResponseData, ModUpdateStatus, Callback, ErrorType };
//# sourceMappingURL=index.d.ts.map