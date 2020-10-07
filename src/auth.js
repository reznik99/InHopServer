
const LocalStrategy = require('passport-local').Strategy;

const bcrypt = require('bcryptjs');
const pool = require('./config/dbConfig').pool;

const BCRYPT_SALT_ROUNDS = 12;

module.exports = (passport) => {
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });


    passport.use('register', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        session: false,
    }, (username, password, done) => {

        pool.query('SELECT username FROM users WHERE username=$1', [username], (err, results) => {
	    if (err) {
                console.log(err.stack)
            } else {
                if (results.rows.length > 0)
                    return done(null, false, { message: 'Username already taken' });

                // Create new user (HASH PASSWORD)
                bcrypt.hash(password, BCRYPT_SALT_ROUNDS, (err, hash) => {
                    pool.query('INSERT INTO users VALUES ($1, $2) RETURNING *', [username, hash], (err, results) => {
                        return done(null, results.rows[0]);
                    });
                });
            }
        });
    })
    );

    passport.use('login', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        session: false,
    }, (username, password, done) => {

        pool.query('SELECT * FROM users WHERE username=$1', [username], (err, results) => {
	    if (err) {
                console.log(err.stack)
            } else {
                if (results.rows.length < 1)
                    return done(null, false, { message: 'Username doesn\'t exist' });

                // Compare hashes
                let user = results.rows[0];

                bcrypt.compare(password, user.password_hash).then(response => {
                    // Invalid credentials
                    if (response != true) {
                        return done(null, false, { message: 'Invalid username and/or password' });
                    }
                    // Valid credentials
                    return done(null, user);
                });
            }
        });
    }
    ));
};
