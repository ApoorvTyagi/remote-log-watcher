const fs = require('fs');
const { EventEmitter } = require('events');

const buffer = new Buffer.alloc(1024);

// Configurations
const NO_OF_LINES = process.env.NO_OF_LINES;

class Tail extends EventEmitter {
    #logFile
    #queue
    constructor(logFile) {
        super();
        this.#logFile = logFile;
        this.#queue = [] // To store last 10 logs
    }

    bootstrap() {
        fs.open(this.#logFile, (err, fd) => {
            if (err) throw new Error('Error in opening file', err);

            fs.read(fd, buffer, 0, buffer.length, 0, (err, bytes) => {
                if (err) throw new Error('Error in reading file', err);

                if (bytes > 0) {                   
                    const data = buffer.slice(0, bytes).toString();
                    const logs = data.split('\n');

                    this.#queue = [];
                    for(let index = (NO_OF_LINES * -1); index < 0; index++) { // O(1) complexity
                        const log = logs.at(index);
                        this.#queue.push(log.trim().replace(/\n|\r/g, ""));
                    }
                    // logs.slice(-10).forEach(log => this.#queue.push(log));
                }
            })

            fs.watchFile(this.#logFile, {'interval': 500}, (curr, prev) => {
                this.monitor(curr, prev);
            })
        })
    };

    monitor(curr, prev) {
        fs.open(this.#logFile, (err, fd) => {
            if (err) throw new Error('Error in opening file', err);

            fs.read(fd, buffer, 0, buffer.length, prev.size, (err, bytes) => {
                if (err) throw new Error('Error in reading file', err);

                if (bytes > 0) {
                    const data = buffer.slice(0, bytes).toString();
                    const logs = data.split('\n');

                    if (logs.length >= NO_OF_LINES) {
                        this.#queue = [];
                        for(let index = (NO_OF_LINES * -1); index < 0; index++) { // O(1) complexity
                            const log = logs.at(index);
                            this.#queue.push(log.trim().replace(/\n|\r/g, ""));
                        }
                        // logs.slice(-10).forEach((log) => this.#queue.push(log));
                    } else {
                        logs.forEach((log) => {
                            if(this.#queue.length >= NO_OF_LINES) {
                                this.#queue.shift();
                            }
                            this.#queue.push(log.trim().replace(/\n|\r/g, ""));
                        })
                    }
                    log(this.#queue);
                    this.emit('new-logs', this.#queue);
                }
            })
        })
    };

    getLatestData() {
        return this.#queue;
    }
}

module.exports = Tail;