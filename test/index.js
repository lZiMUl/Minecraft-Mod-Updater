const { exec } = require('node:child_process');
const { info, error } = require('node:console');

exec('npm i -g minecraft-mod-update', () => {
    [ 'mcmu-cli -V', 'mcmu-cli -h' ].forEach((command) =>
        exec(command, (err, data) => {
            info(`test command ${command}`);
            if (!err) {
                info(data);
            } else {
                error(err);
            }
        })
    );
})
