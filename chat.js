const express = require('express')
const ws = require('ws')

wsSockets = []

function init(server) {
    const wsServer = new ws.Server({ noServer: true, path: '/chat' })

    wsServer.on('connection', socket => {
        socket.on('message', message => {
            wsSockets.forEach(s => {
                if (s != socket) {
                    s.send(message)
                }
            })
        })
        
        socket.on('close', () => {
            wsSockets = wsSockets.filter(s => (s !== socket))
        })
    });

    server.on('upgrade', (request, socket, head) => {
        wsServer.handleUpgrade(request, socket, head, (socket) => {
            wsSockets.push(socket)
            wsServer.emit('connection', socket, request)
        })
    })
}

module.exports = init