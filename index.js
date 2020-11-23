const express = require('express')
const http = require('http')
const bodyParser = require('body-parser')
const cors = require('cors')
const fs = require('fs')
const ws = require('ws')

const {createAPI} = require('./api')

const databaseFilename = 'database.json'
const database = JSON.parse(fs.readFileSync(databaseFilename))

const app = express()

app.wsSockets = []

fs.watch(databaseFilename, (event, filename) => {
    setTimeout(() => {
        try {
            if (filename === databaseFilename) {
                const db = JSON.parse(fs.readFileSync(databaseFilename))
                database.data = db.data
                console.log('database read')
                
                app.wsSockets.forEach(socket => {
                    socket.send("update")
                })
            }
        }
        catch (err) {
            console.log(err)
        }    
    }, 100)
})

app.database = database

const wsServer = new ws.Server({ noServer: true, path: '/ws' })

const corsOptions = {
    origin: 'http://localhost:8081'
}

app.use(cors(corsOptions))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

createAPI(app)

const PORT = process.env.PORT || 8080

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}.`)
})

wsServer.on('connection', socket => {
    socket.on('message', message => console.log(message))
});

server.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, (socket) => {
        app.wsSockets.push(socket)
        wsServer.emit('connection', socket, request)
    })
})

function exitHandler(exitCode) {
    fs.writeFileSync(databaseFilename, JSON.stringify(database))
    process.exit();
}

process.on('exit', exitHandler);
process.on('SIGINT', exitHandler);
process.on('SIGUSR1', exitHandler);
process.on('SIGUSR2', exitHandler);
process.on('uncaughtException', exitHandler);
