enum TypeEnum {
    JarFile = 'JarFile',
    Manifest = 'Manifest'
}

enum ErrorEnum {
    ADDRESS = 'ADDRESS',
    DOWNLOAD = 'DOWNLOAD',
}

enum EventNameEnum {
    INIT = 'init',
    FINISHED = 'finished',
}

interface Config {
    output: string;
    apiKey: string;
    forceDownload: boolean;
}

interface Parameter extends Config {
    type: TypeEnum
    input: string;
    version: string;
    loader: string;
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
    id: string;
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
    mod: T
}

enum EventEnum {
    DOWNLOADING = 'downloading',
    DOWNLOADED = 'downloaded',
    SKIPPED = 'skipped',
    FINISHED = 'finished',
    ERRORED = 'errored'
}
type Callback<T> = (data: T) => void;

export { ErrorEnum, EventEnum, EventNameEnum };
export type {
    Config,
    Parameter,
    ModFormat,
    ModInfo,
    ModLoader,
    ManifestFormat,
    ForgeResponseData,
    ModUpdateStatus,
    Callback,
    ErrorType
};
