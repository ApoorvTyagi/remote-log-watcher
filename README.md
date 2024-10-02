# remote-log-watcher

## Description
`remote-log-watcher` is a real-time log monitoring solution (Replica of [tail](https://www.linuxtoday.com/developer/linux-tail-command/#:~:text=The%20tail%20command%20displays%20the,with%20other%20tools%20like%20grep.) command of linux). It streams updates from a remote append-only log file to a web-based client. The client receives real-time updates without a page refresh, only displaying the last 10 lines of the log when first loaded. The server handles multiple clients and only streams new updates as they occur, without retransmitting the entire log file.

## Features
- **Real-time log streaming:** Updates are pushed to the client in real-time as the log file grows.
- **Optimized last 10 lines retrieval:** Only the last 10 lines are fetched on the client’s first connection.
- **Efficient data transfer:** Only new log lines are transmitted, not the entire file.
- **Multiple client handling:** Supports multiple clients receiving updates simultaneously.
- **WebSocket communication:** Clients are updated without page reloads.

## Requirements
- Express
- Socket.IO

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/apoorvtyagi/remote-log-watcher.git
    cd remote-log-watcher
    ```

2. Install the dependencies:

    ```bash
    npm install
    ```

3. Set up environment variables:

    Create a `.env` file at the root of the project and add the following configuration:
    ```
    PORT=3000
    NO_OF_LINES=10
    ```

4. Make sure to have a log file available for monitoring. By default, the app looks for a log file at `./logs/server.log`. You can modify this path in `app.js`.

## Running the Application

To start the server, run the following command:

```bash
npm run start
```

## Usage
- Navigate to http://localhost:3000/log in your browser.
- You will see the last 10 lines of the log file.
- As new logs are appended to the log file, they will automatically appear on the page in real time without any need to refresh the browser.

## Folder Structure

```bash
remote_log_watcher/
├── src/
│   ├── logs/
│   │   └── server.log           # Log file being monitored (append-only)
│   ├── views/
│   │   └── index.html           # Client-side HTML to display logs
│   ├── modules/
│   │   ├── tail/
│   │   │   ├── tail.service.js  # Service to monitor the log file
│   │   │   └── tail.routes.js   # Route handler for log serving
│   │   └── index.js             # Module to setup routes
├── .env                         # Environment variables
├── app.js                       # Main server file
├── package.json                 # Node.js dependencies and scripts
└── README.md                    # Project documentation
```

## Code Explanation
#### `tail.service.js`
This file contains the Tail class that monitors and reads the log file. The service:

- Reads and monitors the file for new log entries.
- Uses EventEmitter to notify connected clients of new log data.
- Efficient memory management by only storing the last 10 lines of the log.

#### `tail.routes.js`
This route handler serves the log viewing page. It:

- Serves index.html on the /log route when a GET request is made.
- Uses path.join() to resolve the path to the views/index.html file.

#### `index.js` (in modules)
This file sets up the route for the application. It:

- Imports the tail.routes.js and mounts it on the base URL.
- Uses Express's router to make the log route accessible.

#### `app.js`
This is the main server entry point. It:

- Sets up the Express server and listens for connections.
- Integrates Socket.IO for real-time updates to clients.
- Initializes the Tail service to monitor the log file.

#### `index.html`
This client-side HTML file connects to the server via WebSocket using Socket.IO and:

- Fetches the last 10 log entries when the page loads.
- Displays real-time log updates pushed by the server without reloading the page.
