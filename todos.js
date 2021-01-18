const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const {authenticateJWT, signJWT} = require('./authUtils.js')

const TodoDB = require('./todoDB')
const todoDB = new TodoDB()

router.get('/', authenticateJWT, (req, res) => {
    todoDB.getAllTodos()
        .then(database => {
            res.json(database.data)
        })
})

router.get('/:id(\\d+)', authenticateJWT, (req, res) => {
    todoDB.getTodo(req.params.id)
        .then(todo => res.json(todo))
        .catch(err => {
            res.status(404).json({
                message: err
            })
        })
})

router.put('/:id(\\d+)', authenticateJWT, (req, res) => {
    const todo = req.body
    todo.id = req.params.id
    todoDB.updateTodo(todo)
        .then(() => {
            res.wss.clients.forEach(client => {
                client.send(JSON.stringify({
                    message: 'update_todo',
                    todo: todo
                }))
            })
            res.json({
                message: 'ok'
            })
        })
})


router.post('/', authenticateJWT, (req, res) => {
    const todo = req.body
    todo.id = Date.now()
    todoDB.createTodo(todo)
        .then(() => {
            res.wss.clients.forEach(client => {
                client.send(JSON.stringify({
                    message: 'add_todo',
                    todo: todo
                }))
            })
            res.json(todo)
        })
})

router.delete('/:id(\\d+)', authenticateJWT, (req, res) => {
    todoDB.deleteTodo(req.params.id)
        .then(() => {
            res.wss.clients.forEach(client => {
                client.send(JSON.stringify({
                    message: 'delete_todo',
                    todo_id: req.params.id
                }))
            })
            res.json({
                message: 'ok'
            })
        })
        .catch(err => {
            res.status(404).json({
                message: "Not found."
            })
        })
})

module.exports = router