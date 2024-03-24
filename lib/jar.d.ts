/// <reference types="node" />
/// <reference types="node" />
import { EventEmitter } from 'node:events';
declare class Jar extends EventEmitter {
    private readonly file;
    constructor(files: string);
    readFile(path: string): Promise<Buffer>;
}
export default Jar;
//# sourceMappingURL=jar.d.ts.map