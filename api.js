function createAPI(app) {

    app.get('/', (req, res) => {
        res.json({ message: 'Welcome' })
    })
    
    app.get('/birthdays', (req, res) => {
        res.json(app.database.data)
    })
    
    app.post('/birthdays', (req, res) => {
        const birthday = req.body
        birthday.id = Date.now()
        app.database.data.push(birthday)
        res.json({
            message: 'ok'
        })

        app.wsSockets.forEach(socket => {
            socket.send("update")
        })
    })

    app.delete('/birthdays/:id', (req, res) => {
        const data = app.database.data.filter(d => (d.id != req.params.id))
        
        if (data.length != app.database.data.length) {
            app.database.data = data
            app.wsSockets.forEach(socket => {
                socket.send("update")
            })

            res.json({
                message: 'ok'
            })
        } else {
            res.status(404).json({
                message: 'record not found'
            })
        }
    })
}

exports.createAPI = createAPI