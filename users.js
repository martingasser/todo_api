const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const { authenticateJWT, signJWT } = require('./authUtils.js')

const UsersDB = require('./usersDB')

const usersDB = new UsersDB()

router.get('/', authenticateJWT, (req, res) => {
    usersDB.getAllUsers()
        .then(users => {
            res.json(users)
        })
})

router.post('/login', (req, res) => {
    const { username } = req.body
    usersDB.getAllUsers()
        .then(users => {
            let user = users.find(u => u.username == username)
            if (!user) {
                const colour = [
                    Math.round(Math.random() * 200),
                    Math.round(Math.random() * 200),
                    Math.round(Math.random() * 200)
                ]

                user = {
                    username,
                    colour
                }
                return usersDB.createUser(user).then(() => {
                    res.wss.clients.forEach(client => {
                        client.send(JSON.stringify({
                            message: 'add_user',
                            user: user
                        }))
                    })

                    return user
                })
            }
            return user
        })
        .then(user => {
            const accessToken = signJWT(user)
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

module.exports = router