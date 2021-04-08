'use strict'

import { app, protocol, BrowserWindow } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'
const { ipcMain } = require('electron')
const tmi = require('./tmi');

const express = require('express');
const appExpress = express();
const http = require('http');
const server = http.createServer(appExpress);
const io = require('socket.io')(server,{
  allowEIO3: true,
  cors: {
    origin: "http://localhost:8081",
    methods: ["GET", "POST"],
    credentials: true
  }
});

appExpress.use(express.static(__dirname + '/theme'));

appExpress.get('/', (req, res) => {
  res.sendFile(__dirname + '/theme/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});


// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

global.connected = false

global.poll = {
  channel: '',
  replys: [],
  users: []
}

io.on("connect", () => {
  io.emit('results', getResults());
})

ipcMain.handle('connect', async (event, poll) => {
  global.poll = {
    channel: '',
    replys: [],
    users: []
  }
  
  global.poll.channel = poll.channel
  global.poll.replys = poll.replys
  global.connected = !global.connected

  if (global.connected == true) {
    tmi.client.join(global.poll.channel)
  } else {
    tmi.client.part(global.poll.channel)
  }
  
  io.emit('results', getResults());

  return global.connected;
})

tmi.client.on('message', (channel, tags, message, self) => {
  if(self) return;
  global.poll.replys.map( word => {
    let regex = new RegExp(word, "gmi");

    if (regex.test(message)) {
      let users = global.poll.users.filter( user => {
        return user['user-id'] == tags['user-id'];
      });
      if (users.length == 0) {
        let vote = {
          "user-id": tags['user-id'],
          "word": word
        }
        global.poll.users.push(vote);

        io.emit('results', getResults());
      }
    }
  });
});

function getResults() {
  let results = [];
  let length = global.poll.users.length;

  global.poll.replys.map( word => {
    let result = global.poll.users.filter( user => {
      return user.word == word;
    });

    results.push({
      word: word,
      count: result.length,
      percentage: length > 0 ? ((result.length / length) * 100).toFixed(2) : 0
    });
  });

  return results
}