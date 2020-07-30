var express = require('express');
var sqlite3 = require('sqlite3')
var router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;

//open db
let db = new sqlite3.Database("mydb.db", sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.log(err);
    }
    console.log("Connected")
});

//log all requests
router.use((req, res, next) => {
    console.log(req.method + " request made for " + req.url);
    next();
})

//main redirect only if the user is logged in
router.get("/main", function(req, res, next) {
    if (req.session.loggedin) {
        next();
    } else {
        res.redirect("/login")
    }
})

//retrieve username
router.get("/user", function (req, res) {
    if (req.session.loggedin) {
        db.get("SELECT id, username FROM users WHERE id == ?", [req.session.userID], (err, row) => {
            if (err) {
                console.log(err);
            }
            res.json(row);
        })
    } else {
        res.end("Error, not logged in")
    }
})

router.get("/login", function(req, res, next) {
    if (req.session.loggedin) {
        res.redirect("/main");
    } else {
        next();
    }
})

router.get("/logout", function(req, res) {
    if (req.session.loggedin) {
        req.session.destroy();
    }
    res.end("OK");
})

//static folder with default html extension
router.use(express.static('public', {
    extensions: ['html']
}))


//handle login request
router.post("/login", function(req, res) {
    let username = req.body.username;
    let password = req.body.password;
    if (username == "" || password == "") {
        res.status(400).end("ERROR: missing values")
    } else {
        attemptLogin(username, password, res, req);
    }
})

//handle register request
router.post("/register", function(req, res) {
    let username = req.body.username;
    let password = req.body.password;
    if (username == "" || password== "") {
        res.status(400).end("ERROR: no username or password");
    } else {
        attemptRegister(username, password, res);
    }
})

function attemptLogin(username, password, res, req) {
    db.get('SELECT * FROM users WHERE username == ?', [username], (err, row) => {
        if (err) {
            console.log(err)
        }
        if (row) {
            bcrypt.compare(password, row.password, function(err, result) {
                if (err) {
                    console.log(err)
                }
                if (result) {
                    req.session.loggedin = true;
                    req.session.userID = row.id;
                    res.status(200).end("Succesfully logged in with id " + row.id);
                } else {
                    res.status(401).end("Failed login (incorrect password)");
                }
            })

        } else {
            res.status(401).end("Failed login ");
        }
    })
}

function attemptRegister(username, password, res) {
    //hash passwords
    bcrypt.hash(password, saltRounds, function(err, hash) {
            if (err) {
                console.log(err);
            }
            //attempt to register
            db.all('SELECT * FROM users WHERE username == ?', [username], (err, rows) => {
                if (err) {
                    console.log(err)
                }
                if (rows.length > 0) {
                    res.status(409).end("Username not available");
                } else {
                    db.run('INSERT INTO users(username, password) VALUES (?, ?)', [username, hash], function(err) {
                        if (err) {
                            console.log(err)
                        }
                        res.status(201).end("Account created with username " + username)
                    });
                }
            })

    })
}


//404 page
router.use(function(req, res) {
    res.status(404);
    res.end("404 ERROR")
})

module.exports = router;
