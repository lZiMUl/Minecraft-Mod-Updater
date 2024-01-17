#!/node_modules/minecraft-mod-updater/node_modules/electron/dist/electron
import { argv, env } from 'node:process';
import { Command } from 'commander';
import { join, resolve } from 'node:path';
import { app, BrowserWindow, BrowserWindowConstructorOptions, Notification, screen } from 'electron';

import { description, name, version } from '../../package.json';
import { Args, Parameter, Size } from '../index';

const command: Command = new Command('mcmu');
const program: Command = command.description(description).version(version);

program.option('-i, --file <path>', 'path to the manifest file', join(resolve('.'), './manifest.json'));
program.option('-o, --outDir <path>', 'path to the output', resolve('.'));
program.option('-k, --apiKey <text>', 'api key', env['MCMU_APIKEY'] ?? 'none');
program.option('-f, --forceDownload', 'force download', false);

program.parse(argv);

class GUI extends BrowserWindow {
    public static status: boolean = false;
    private notification: Notification;
    private args: Parameter = program.opts<Parameter>();

    public constructor(config: BrowserWindowConstructorOptions, args: Args) {
        super(config);
        this.notification = new Notification({
            'title': args.title,
            'body': args.body
        });
        if (GUI.status) {
            super.loadURL('https://lzimul.top/archives/b628cc84-7903-4ecd-8205-8626dba18f68').then((): void => {
                this.notification.show();
                this.notification.addListener('click', this.handle.bind(this));
                this.notification.addListener('close', this.handle.bind(this));
            });
        } else {
            throw new Error(JSON.stringify(this.args));
        }
    }

    private handle(): void {
        this.notification.show();
    }
}

(async (): Promise<void> => {
    const message: string = 'Not yet developed, stay tuned';
    try {
        await app.whenReady();
        app.setAppUserModelId(name);
        const { width, height }: Size = screen.getPrimaryDisplay().size;
        GUI.status = true;
        new GUI({
            'title': name,
            'width': width / 2,
            'height': height / 2
        }, {
            'title': name,
            'body': description
        });
    } catch (err) {
        throw new Error(message);
    }
})();