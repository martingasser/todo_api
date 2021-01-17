const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')

const TodoDB = require('./todoDB')
const UsersDB = require('./usersDB')

const todoDB = new TodoDB()
const usersDB = new UsersDB()

const accessTokenSecret = 'asdkflj89we##+ß093izhjjsdfdmfj'

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization
    if (authHeader) {
        const token = authHeader.split(' ')[1]
        jwt.verify(token, accessTokenSecret, (err, user) => {
            if (err) {
                return res.sendStatus(403)
            }
            req.user = user
            next()
        })
    } else {
        res.status(401).json({
            message: 'Invalid token.'
        })
    }
}

router.post('/login', (req, res) => {
    const { username } = req.body
    usersDB.getAllUsers()
    .then(users => {
        let user = users.find(u => u.username == username)
        if (! user) {
            const colour = [
                Math.round(Math.random()*256),
                Math.round(Math.random()*256),
                Math.round(Math.random()*256)
            ]

            user = {
                username,
                colour
            }
            return usersDB.createUser(user).then(() => {
                return user
            })
        }
        return user
    })
    .then(user => {
        const accessToken = jwt.sign(user, accessTokenSecret)
        res.json({
            user,
            accessToken        
        })
    })
})

router.get('/isLoggedIn', authenticateJWT, (req, res) => {
    res.json({
        message: 'ok'
    })
})

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