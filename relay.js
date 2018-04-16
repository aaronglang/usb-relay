"use strict";
const util = require('./helpers/util.js');

class Relay {
    constructor(path) {
        this.path = path;
        this.err_message = 'Error getting USB data!';
    }

    set data(_data) {
        this.Data = _data;
    }

    get data(){
        return this.Data;
    }

    getPath(add) {
        return 'echo `' + this.path + add + '`';
    }

    async init() {
        let err, data;
        [err, data] = await util.to(this.objectify());
        if(err) util.TE('Error Initializing Relays!');
        return data;
    }

    async dataToObjectArray() {
        let err, res, boards, cmd, add;
        add = ` enum`;
        cmd = this.getPath(add);
        [err, res] = await util.to(util.command(cmd));
        if(err) util.TE('No USB devices found!', true);
        if(typeof res === 'undefined') util.TE('No USB devices found!', true);
        boards = res.replace('\n', ' ').replace(/ID/gi, 'id').replace(/State/gi, 'state');
        boards = boards.split('Board');
        let arr = [];
        for(let b of boards) {
            let info = b.toString();
            info = info.split(' ');
            if (info[0] === 'Board') info.shift();
            let Board = {};
            let val, name;
            for (let i of info) {
                let ind = i.split('');
                if (ind.includes(':') || ind.includes('=')) {
                    let index;
                    if (ind.includes(':')) {
                        index = ind.indexOf(':');
                        name = ind.slice(0, index).join('');
                        val = {};
                    }
                    if (ind.includes('=')) {
                        index = ind.indexOf('=');
                        name = ind.slice(0, index).join('');
                        index += 1;
                        val = ind.slice(index).join('');
                    }
                    Board[name] = val;
                }
            }
            if(Object.keys(Board).length !== 0 && Board.constructor === Object) arr.push(Board);
        }
        return arr;
    }

    async objectify() {
        let err, data, relays, keys;
        [err, data] = await util.to(this.dataToObjectArray());
        if(err) util.TE(this.err_message, true);
        if(!data[0].id) util.TE('Error getting USB data!', true);
        for(let ind of data) {
            let parsing = ind.id.split('');
            parsing.pop();
            parsing.shift();
            ind.id = parsing.join('');
            keys = Object.entries(ind);
            relays = keys.slice(2);
            for(let rel of relays) {
                if(rel[1] === 'OFF') rel[1] = false;
                if(rel[1] === 'ON') rel[1] = true;
                ind.state[rel[0]] = rel[1];
                delete ind[rel[0]];
            }
            ind.relays = Object.values(ind.state).length;
        }
        this.data = data;
        return data;
    }

    async getRelayIds() {
        let err, data, id, arr, idArr;
        idArr = [];
        [err, data] = await util.to(this.objectify());
        if(err) util.TE('Error Getting IDs!');
        for(let i of data) {
            idArr.push(i.ID);
        }
        return idArr;
    }

    async getBoardById(id) {
        let err, data, board;
        [err, data] = await util.to(this.objectify());
        if(err) util.TE(this.err_message);
        board = data.filter(obj => obj.id === id);
        return board[0];
    }

    async getNumberOfRelaysById(id) {
        let err, data, board;
        [err, data] = await util.to(this.dataToObjectArray());
        if(err) util.TE('Error Getting Number of Relays!');
        board = data.filter(obj => obj.ID === id);
        console.log(board);
    }

    async getBoardByStatus(status) {
        let err, data, board;
        [err, data] = await util.to(this.objectify());
        if(err) util.TE('Error finding Boards with Status!');
        board = data.filter(obj => Object.values(obj.state).includes(status));
        console.log(board);
        return board;
    }

    async checkStatus(id) {
        let err, boards, board, relay;
        [err, boards] = await util.to(this.objectify());
        if(err) util.TE('Error getting Relay Data!');
        board = boards.filter(b => b.id === id)[0];
        relay = board.state;
        console.log(relay);
        return relay;
    }

    async toggleOne(toggle, id, relay_number) {
        let err, res, board, cmd, add;
        [err, board] = await util.to(this.getBoardById(id));
        if(err) util.TE('Error Finding Relay!');

        add = ` ID=${board.id} ${toggle} ${relay_number}`;
        cmd = this.getPath(add);
        [err, res] = await util.to(util.command(cmd));
        if(err) util.TE('Error getting devices!');
        console.log(res);
    }
    async allofOne(toggle, id) {
        let err, res, board, cmd, add;
        [err, board] = await util.to(this.getBoardById(id));
        if(err) util.TE('Error Finding Relay!');
        add = ` ID=${board.id} ${toggle} ALL`;
        cmd = this.getPath(add);
        [err, res] = await util.to(util.command(cmd));
        if(err) util.TE('Error getting devices!');
    }
    async all(toggle) {
        let err, res, cmd, add, boards;
        [err, boards] = await util.to(this.objectify());
        if(err) util.TE(this.err_message);
        for(let board of boards) {
            console.log(`Toggling Relay Board ${board.id} ${toggle}`);
            add = ` ID=${board.id} ${toggle} ALL`;
            cmd = this.getPath(add);
            [err, res] = await util.to(util.command(cmd));
            if(err) util.TE('Error getting devices!');
        }
    }
}
const init = function(path) {
    if(typeof path === 'undefined') {
        throw new Error('PLEASE SPECIFY PATH TO EXECUTABLE example: \'./node_modules/usb-relay/scripts/relaycmd\'');
    }
    return new Relay(path);
}
module.exports.init = init;