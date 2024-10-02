const fs = require('fs');
const { EventEmitter } = require('events');

const readBuffer = new Buffer.alloc(1024);

// Configuration
const MAX_LOG_LINES = process.env.MAX_LOG_LINES;

class Tail extends EventEmitter {
    #logFile
    #queue

    constructor(filePath) {
        super();
        this.#logFile = filePath;
        this.#queue = []; // To store last 10 logs
    }

    bootstrap() {
        fs.open(this.#logFile, (err, fileDescriptor) => {
            if (err) throw new Error('Failed to open file', err);

            fs.read(fileDescriptor, readBuffer, 0, readBuffer.length, 0, (err, bytesRead) => {
                if (err) throw new Error('Failed to read file', err);

                if (bytesRead > 0) {                   
                    const content = readBuffer.slice(0, bytesRead).toString();
                    const logEntries = content.split('\n');

                    this.#queue = [];
                    for (let index = (NO_OF_LINES * -1); index < 0; index++) { // O(1) complexity
                        const log = logEntries.at(index);
                        this.#queue.push(log);
                    }
                }
            });

            fs.watchFile(this.#logFile, {'interval': 500}, (current, previous) => {
                this.monitorFile(current, previous);
            });
        });
    }

    monitorFile(_current, previous) {
        fs.open(this.#logFile, (err, fileDescriptor) => {
            if (err) throw new Error('Failed to open file', err);

            fs.read(fileDescriptor, readBuffer, 0, readBuffer.length, previous.size, (err, bytesRead) => {
                if (err) throw new Error('Failed to read file', err);

                if (bytesRead > 0) {
                    const content = readBuffer.slice(0, bytesRead).toString();
                    const newEntries = content.split('\n');

                    if (newEntries.length >= MAX_LOG_LINES) {
                        this.#queue = [];
                        for (let index = (NO_OF_LINES * -1); index < 0; index++) { // O(1) complexity
                            const log = newEntries.at(index);
                            this.#queue.push(log);
                        }
                    } else {
                        newEntries.forEach((log) => {
                            if (this.#queue.length >= MAX_LOG_LINES) {
                                this.#queue.shift();
                            }
                            this.#queue.push(log);
                        });
                    }
                    this.emit('new-logs', this.#queue);
                }
            });
        });
    }

    getLatestLogs() {
        return this.#queue;
    }
}

module.exports = Tail;