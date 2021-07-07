const pool = require('./config/dbConfig').pool

const createRoutes = (app, passport) => {

    app.post('/login', (req, res, next) => {
        passport.authenticate('login', (err, user, info) => {
            //Internal error
            if (err) {
                console.error(`error ${err}`)
                res.status(500).send({
                    auth: false, message: err,
                })
            }
            //Unauthorized
            else if (info !== undefined) {
                let errorCode = 403
                console.error(info.message)
                if (info.message === 'Invalid username and/or password') errorCode = 401
                res.status(errorCode).send({
                    auth: false, message: info.message,
                })
            }
            //Authorized
            else {
                console.log(user)
                res.status(200).send({
                    auth: true,
                    message: 'user found & logged in',
                })
            }
        })(req, res, next)
    })

    app.post('/signup', (req, res, next) => {
        passport.authenticate('register', (err, user, info) => {
            if (err) {
                console.error(`error ${err}`)
            }
            if (info !== undefined) {
                console.error(info.message)
                res.status(403).send(info.message)
            } else {
                // Todo
                res.status(200).send({
                    message: 'user created',
                })
            }
        })(req, res, next)
    })
}

module.exports = createRoutes
