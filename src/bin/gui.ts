#!/usr/bin/env electron
import { app, BrowserWindow, BrowserWindowConstructorOptions } from 'electron';

class GUI extends BrowserWindow {
    private status: boolean = false;
    public constructor(config: BrowserWindowConstructorOptions) {
        super(config);
        if(this.status) {
            super.loadURL('https://lzimul.top/archives/b628cc84-7903-4ecd-8205-8626dba18f68');
        } else {
            throw new Error('Not yet developed, stay tuned');
        }
    }
}

(async (): Promise<void> => {
    try {
        await app.whenReady();
        new GUI({
            'width': 800,
            'height': 600
        });
    } catch (err) {
        throw new Error('Not yet developed, stay tuned');
    }
})();