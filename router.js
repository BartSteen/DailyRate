var express = require('express');
var sqlite3 = require('sqlite3')
var router = express.Router();

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

//admin redirect only if the user is logged in
router.get("/admin", function(req, res, next) {
    if (req.session.loggedin) {
        next();
    } else {
        res.redirect("/login")
    }
})

router.get("/user", function (req, res) {
    if (req.session.loggedin) {
        db.get("SELECT * FROM users WHERE id == ?", [req.session.userID], (err, row) => {
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
        res.redirect("/admin");
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
    db.all('SELECT * FROM users WHERE username == ? AND password == ?', [username, password], (err, rows) => {
        if (err) {
            console.log(err)
        }
        if (rows.length > 0) {
            req.session.loggedin = true;
            req.session.userID = rows[0].id;
            res.status(200).end("Succesfully logged in with id " + rows[0].id);
        } else {
            res.status(401).end("Failed login (username pw combination does not exist)");
        }
    })
}

function attemptRegister(username, password, res) {
    db.all('SELECT * FROM users WHERE username == ?', [username], (err, rows) => {
        if (err) {
            console.log(err)
        }
        if (rows.length > 0) {
            res.status(409).end("Username not available");
        } else {
            db.run('INSERT INTO users(username, password) VALUES (?, ?)', [username, password], function(err) {
                if (err) {
                    console.log(err)
                }
                res.status(201).end("Account created with username " + username)
            });
        }
    })
}

//404 page
router.use(function(req, res) {
    res.status(404);
    res.end("404 ERROR")
})

module.exports = router;
