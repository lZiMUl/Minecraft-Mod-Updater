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
interface FilesFormat {
    minecraft: {
        version: string;
        modLoaders: {
            id: string;
            primary: boolean;
        };
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
type Callback<T> = (data: T) => void;
export type { Config, Parameter, ModFormat, ModInfo, FilesFormat, FilesInfo, FilesStatus, Event, Callback };
//# sourceMappingURL=index.d.ts.map