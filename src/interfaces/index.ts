interface Config {
    outDir: string;
    apiKey: string;
    forceDownload: boolean;
}

interface Parameter extends Config {
    filePath: string;
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

interface FilesInfo {
    data: ModInfo[];
}

interface FilesStatus {
    succeed: ModFormat[];
    fail: ModFormat[];
}

type Event = 'downloading' | 'downloaded' | 'skipped' | 'finished' | 'errored';
// eslint-disable-next-line no-unused-vars
type Callback<T> = (data: T) => void;

export type { Config, Parameter, ModFormat, ModInfo, ModLoader, ManifestFormat, FilesInfo, FilesStatus, Event, Callback };
