const path = require('path')
const fs = require('fs').promises
const fs_ = require('fs')

class UsersDB {
    constructor() {
        this.databaseFilename = path.join('.', 'db', 'users.json')

        if (!fs_.existsSync(path.join('.', 'db'))) {
            fs_.mkdirSync(path.join('.', 'db'))
        }

        if (!fs_.existsSync(this.databaseFilename)) {
            fs_.writeFileSync(this.databaseFilename, JSON.stringify({ "data": [] }))
        }
    }

    getAllUsers() {
        return fs.readFile(this.databaseFilename)
            .then(file => JSON.parse(file))
            .then(json => json.data)
    }

    getUser(username) {
        return fs.readFile(this.databaseFilename)
            .then(file => JSON.parse(file))
            .then(json => database.data.filter(d => (d.username == username)))
            .then(data => {
                if (data.length === 1) {
                    return data[0]
                }
                throw new Error("Not found")
            })
    }

    createUser(user) {
        return fs.readFile(this.databaseFilename)
            .then(file => JSON.parse(file))
            .then(database => {
                database.data.push(user)
                return fs.writeFile(this.databaseFilename, JSON.stringify(database))
            })
    }
}

module.exports = UsersDB