const { exec } = require('node:child_process');
const { info, error } = require('node:console');

const mcmuc = 'node ./build/bin/cli.js';
const mcmug = 'node ./build/bin/gui.js';

[`${mcmuc} -V`, `${mcmuc} -h`, `${mcmug} -V`, `${mcmug} -h`].forEach((command) =>
        exec(command, (err, data) => {
            info(`test command ${command}`);
            if (!err) {
                info(data);
            } else {
                error(err);
            }
        })
);