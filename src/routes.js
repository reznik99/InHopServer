const jwtSecret = require('./config/jwtConfig');
const pool = require('./config/dbConfig').pool;

const createRoutes = (app, passport) => {

    app.post('/testLogin', (req, res) => {
	console.log("testLogin");
        res.status(200).send({message: "Error, incorrect username/password!"});
    });

    app.post('/login', (req, res, next) => {
	console.log("body parsing", req.body);
        passport.authenticate('login', (err, user, info) => {
            console.log("test");
	    if (err)
                console.error(`error ${err}`);

            else if (info !== undefined) {
                console.error(info.message);
                if (info.message === 'Invalid username and/or password')
                    res.status(401).send(info.message);
                else
                    res.status(403).send(info.message);
            } else {
                console.log(user);
                // todo: Should get user data from database
                req.logIn(user, () => {
                    const token = jwt.sign({ id: user.phone_no }, jwtSecret.secret, {
                        expiresIn: 60 * 60,
                    });
                    res.status(200).send({
                        auth: true,
                        token,
                        message: 'user found & logged in',
                    });
                });
            }
        })(req, res, next);
    });

    app.post('/signup', (req, res, next) => {
        passport.authenticate('register', (err, user, info) => {
            if (err) {
                console.error(`error ${err}`);
            }
            if (info !== undefined) {
                console.error(info.message);
                res.status(403).send(info.message);
            } else {
                // Todo
                res.status(200).send({
                    message: 'user created',
                });
            }
        })(req, res, next);
    });

    // Protected Routes
    app.post('/addContact', (req, res, next) => {
        passport.authenticate('jwt', (err, user, info) => {
            if (err)
                console.error(`error ${err}`);

            if (info !== undefined) {
                console.error(info.message);
                res.status(403).send(info.message);
            } else {
                let data = req.body;
                pool.query('INSERT INTO contacts VALUES ($1, $2, $3) RETURNING *', [user.id, data.id, data.nickname], (err, result) => {
                    if (err) {
                        console.log(err.stack);
                    } else if (result.rows.length > 0) {
                        res.status(200).send({
                            message: 'Contact added'
                        });
                    }
                });
            }
        })(req, res, next);
    });
};

module.exports = createRoutes;
