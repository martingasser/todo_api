const express = require('express')
const router = express.Router()

const path = require('path')
const fs = require('fs').promises
const databaseFilename = path.join('.', 'db', 'todos.json')

const fs_ = require('fs')

if (! fs_.existsSync(path.join('.', 'db'))) {
    fs_.mkdirSync(path.join('.', 'db'))
    fs_.writeFileSync(path.join('.', 'db', 'todos.json'), JSON.stringify({"data": []}))
}

router.get('/', (req, res) => {
    fs.readFile(databaseFilename)
    .then(file => {
        const database = JSON.parse(file)
        res.json(database.data)
    })
})

router.get('/:id', (req, res) => {
    fs.readFile(databaseFilename)
    .then(file => {
        const database = JSON.parse(file)
        const data = database.data.filter(d => (d.id == req.params.id))
        if (data.length === 1) {
            res.json(data[0])
        } else {
            res.status(404).json({
                message: "Not found."
            })
        }
    })
})

router.post('/', (req, res) => {
    const todo = req.body
    todo.id = Date.now()

    fs.readFile(databaseFilename)
    .then(file => {
        const database = JSON.parse(file)
        database.data.push(todo)
        return fs.writeFile(databaseFilename, JSON.stringify(database))        
    })
    .then(() => {
        res.json({
            message: 'ok'
        })
    })
})

router.delete('/:id', (req, res) => {
    fs.readFile(databaseFilename)
    .then(file => {
        let database = JSON.parse(file)
        const data = database.data.filter(d => (d.id != req.params.id))
        if (data.length !== database.data.length) {
            database.data = data
            return fs.writeFile(databaseFilename, JSON.stringify(database))
            .then(() => {
                res.json({
                    message: 'ok'
                })
            })        
        } else {
            res.status(404).json({
                message: "Not found."
            })
        }
    })
})

module.exports = router