const path = require('path')
const fs = require('fs').promises
const fs_ = require('fs')

class TodoDB {
    constructor() {

        this.databaseFilename = path.join('.', 'db', 'todos.json')

        if (!fs_.existsSync(path.join('.', 'db'))) {
            fs_.mkdirSync(path.join('.', 'db'))
            fs_.writeFileSync(this.databaseFilename, JSON.stringify({ "data": [] }))
        }
    }

    getAllTodos() {
        return fs.readFile(this.databaseFilename)
            .then(file => JSON.parse(file))
    }

    getTodo(id) {
        return fs.readFile(this.databaseFilename)
            .then(file => JSON.parse(file))
            .then(json => database.data.filter(d => (d.id == id)))
            .then(data => {
                if (data.length === 1) {
                    return data[0]
                }
                throw new Error("Not found")
            })
    }

    updateTodo(todo) {
        return fs.readFile(this.databaseFilename)
            .then(file => JSON.parse(file))
            .then(database => {
                const found = database.data.find(t => (t.id == todo.id))

                if (found === undefined) {
                    database.data.push(todo)
                } else {
                    database.data = database.data.map(t => {
                        if (t.id == todo.id) {
                            return { ...t, ...todo }
                        }
                        return t
                    })
                }
                return fs.writeFile(this.databaseFilename, JSON.stringify(database))
            })
    }

    createTodo(todo) {
        return fs.readFile(this.databaseFilename)
            .then(file => JSON.parse(file))
            .then(database => {
                database.data.push(todo)
                return fs.writeFile(this.databaseFilename, JSON.stringify(database))
            })
    }

    deleteTodo(id) {
        return fs.readFile(this.databaseFilename)
            .then(file => JSON.parse(file))
            .then(database => {
                const data = database.data.filter(d => (d.id != id))
                if (data.length !== database.data.length) {
                    database.data = data
                    return fs.writeFile(this.databaseFilename, JSON.stringify(database))
                }
                throw new Error('Not found')
            })
    }
}

module.exports = TodoDB