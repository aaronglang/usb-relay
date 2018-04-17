"use strict";
const util = require('../helpers/util.js');
const Relay = require('../relay.js').Relay;
const schedule = require('node-schedule');

class RelaySchedule extends Relay {

    constructor(path) {
        super(path);
    }

    setTime (time, toggle) {
        const rule = new schedule.RecurrenceRule();
        rule.dayOfWeek = time.days;
        if(toggle) {
            rule.hour = time.hour.start;
            rule.minute = time.minute.start;
            rule.second = time.second.start;
        }
        if(!toggle) {
            rule.hour = time.hour.end;
            rule.minute = time.minute.end;
            rule.second = time.second.end;
        }
        return rule;
    };

    onTime(time, id, unit) {
        let relay = this;
        schedule.scheduleJob(this.setTime(time, true), async function(){
            let err, res;
            [err, res] = await util.to(relay.toggleOne('on', id, unit));
            if(err) util.TE(err);
        });
    }
    offTime(time, id, unit) {
        let relay = this;
        schedule.scheduleJob(this.setTime(time, false), async function(){
            let err, res;
            [err, res] = await util.to(relay.toggleOne('off', id, unit));
            if(err) util.TE(err);
        });
    }
}
module.exports.RelaySchedule = RelaySchedule;
const init = function(path) {
    if(typeof path === 'undefined') {
        throw new Error('PLEASE SPECIFY PATH TO EXECUTABLE example: \'./node_modules/usb-relay/scripts/relaycmd\'\nUse absolute path if possible!');
    }
    return new RelaySchedule(path);
};
module.exports.init = init;