#!/usr/bin/env electron
import { resolve, join } from 'node:path';
import { app, BrowserWindow, screen ,BrowserWindowConstructorOptions, Notification } from 'electron';

import { name, description } from '../../package.json';

import { Args, Size } from '../interfaces/gui';

class GUI extends BrowserWindow {
    public static status: boolean = false;
    private notification: Notification;

    public constructor(config: BrowserWindowConstructorOptions, args: Args) {
        super(config);
        this.notification = new Notification({
            'icon': args.icon,
            'title': args.title,
            'body': args.body
        });
        if (GUI.status) {
            super.loadURL('https://lzimul.top/archives/b628cc84-7903-4ecd-8205-8626dba18f68');
            this.notification.show();
            this.notification.addListener('click', this.handle.bind(this));
            this.notification.addListener('close', this.handle.bind(this));
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