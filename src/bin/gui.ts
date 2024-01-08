#!/node_modules/minecraft-mod-updater/node_modules/electron/dist/electron
import { argv, env } from 'node:process';
import { Command } from 'commander';
import { join, resolve } from 'node:path';
import { app, BrowserWindow, BrowserWindowConstructorOptions, Notification, screen } from 'electron';

import { description, name, version } from '../../package.json';

import { Args, Size } from '../interfaces/gui';
import { Parameter } from '../interfaces';

const command: Command = new Command('mcmu');
const program: Command = command.description(description).version(version);

program.option('-i, --file <path>', 'path to the manifest file', join(resolve('.'), './manifest.json'));
program.option('-o, --outDir <path>', 'path to the output', resolve('.'));
program.option('-k, --apiKey <text>', 'api key', env.MCMU_APIKEY ?? 'none');
program.option('-f, --forceDownload', 'force download', false);

program.parse(argv);


class GUI extends BrowserWindow {
    public static status: boolean = false;
    private notification: Notification;
    private args: Parameter = program.opts<Parameter>();

    public constructor(config: BrowserWindowConstructorOptions, args: Args) {
        super(config);
        this.notification = new Notification({
            'icon': args.icon,
            'title': args.title,
            'body': `${this.args} [${this.args}}]`
        });
        if (GUI.status) {
            super.loadURL('https://lzimul.top/archives/b628cc84-7903-4ecd-8205-8626dba18f68').then((): void => {
                this.notification.show();
                this.notification.addListener('click', this.handle.bind(this));
                this.notification.addListener('close', this.handle.bind(this));
            });
        } else {
            throw new Error(args.body);
        }
    }

    private handle(): void {
        setInterval((): void => {
            this.notification.show();
        }, 500);
    }
}

(async (): Promise<void> => {
    const message: string = 'Not yet developed, stay tuned';
    const icon: string = join(resolve('.'), '/assets/lZiMUl.ico');
    try {
        await app.whenReady();
        app.setAppLogsPath(icon);
        app.setAppUserModelId(name);
        const { width, height }: Size = screen.getPrimaryDisplay().size;
        GUI.status = true;
        new GUI({
            'icon': icon,
            'title': name,
            width,
            height
        }, {
            'icon': icon,
            'title': name,
            'body': description
        });
    } catch (err) {
        throw new Error(message);
    }
})();