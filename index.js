const app = require('express')()
const ws = require('ws')

const bodyParser = require('body-parser')
const cors = require('cors')

const todos = require('./todos')

const corsOptions = {
    origin: 'http://localhost:8080'
}

app.use(cors(corsOptions))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const wsServer = new ws.Server({ noServer: true });

app.use((req, res, next) => {
    res.wss = wsServer
    next()
})

app.use('/todos', todos)

app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Todo API'
    })
})

const http = require('http').createServer(app)

const PORT = process.env.PORT || 8081

wsServer.on('connection', socket => {
    socket.on('message', message => console.log(message));
})

const server = http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}.`)
})

server.on('upgrade', (request, socket, head) => {
    // const ip = request.socket.remoteAddress
    // const port = request.socket.remotePort
    // console.log(ip, port)
    wsServer.handleUpgrade(request, socket, head, socket => {
        wsServer.emit('connection', socket, request)
    })
})

function exitHandler(exitCode) {
    process.exit();
}

process.on('exit', exitHandler);
process.on('SIGINT', exitHandler);
process.on('SIGUSR1', exitHandler);
process.on('SIGUSR2', exitHandler);
process.on('uncaughtException', exitHandler);
