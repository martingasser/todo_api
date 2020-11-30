const app = require('express')()

const bodyParser = require('body-parser')
const cors = require('cors')

const todos = require('./todos')
const chat = require('./chat')

const corsOptions = {
    origin: 'http://localhost:8081'
}

app.use(cors(corsOptions))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/todos', todos)

const http = require('http').createServer(app)

const PORT = process.env.PORT || 8080

const server = http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}.`)
})

chat(server)

function exitHandler(exitCode) {
    process.exit();
}

process.on('exit', exitHandler);
process.on('SIGINT', exitHandler);
process.on('SIGUSR1', exitHandler);
process.on('SIGUSR2', exitHandler);
process.on('uncaughtException', exitHandler);
