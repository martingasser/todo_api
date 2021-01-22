const config = require('config')

const app = require('express')()
const ws = require('ws')
const bodyParser = require('body-parser')
const cors = require('cors')

const todos = require('./todos')
const users = require('./users')

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const server = require('http').createServer(app)
const wsServer = new ws.Server({
    server: server
})

app.use((req, res, next) => {
    res.wss = wsServer
    next()
})

app.use('/todos', todos)
app.use('/users', users)

app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Todo API'
    })
})

const PORT = config.has('PORT') ? config.get('PORT') : 8080

wsServer.on('connection', socket => {
    socket.on('message', message => console.log(message));
})

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}.`)
})

function exitHandler(exitCode) {
    process.exit();
}

process.on('exit', exitHandler);
process.on('SIGINT', exitHandler);
process.on('SIGUSR1', exitHandler);
process.on('SIGUSR2', exitHandler);
process.on('uncaughtException', exitHandler);
