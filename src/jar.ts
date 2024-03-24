import { EventEmitter } from 'node:events';
import { join, normalize, resolve } from 'node:path';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import archive from 'ls-archive';

class Jar extends EventEmitter {
    private readonly file: string;
    public constructor(files: string) {
        super();
        this.file = normalize(join(resolve('.') , './mods', files));
    }

    readFile(path: string): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            archive.readFile(this.file, normalize(path), function (err: never, data: Buffer | PromiseLike<Buffer>) {
                if (!err) {
                    resolve(data);
                } else {
                    reject(err);
                }
            });
        });

    }
}

export default Jar;