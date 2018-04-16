"use strict";
const functions = require('error-handlers').init();
const util = require('util');
const exec = util.promisify(require('child_process').exec);

class Util {

    constructor() {
        this.TE = functions.ThrowError;
        this.to = functions.CatchError;
    }
    async command(command) {
        console.log(`Executing this command: ${command}`);
        let {stderr, stdout} = await exec(command);
        if(stderr) {
            this.TE('Error Executing Command: ' + command, true);
            return stderr;
        }
        return stdout;
    }
}
module.exports = new Util();