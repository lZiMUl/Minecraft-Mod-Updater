const { exec } = require('node:child_process');
const { info, error } = require('node:console');

[ 'node . -V', 'node . -h' ].forEach((command) =>
    exec(command, (err, data) => {
        info(`test command ${command}`);
        if (!err) {
            info(data);
        } else {
            error(err);
        }
    })
);