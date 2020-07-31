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

//retrieve ratings
router.get("/rate", function(req, res) {
    let date = new Date(req.query.dateString);
    let numericDate = getNumericDate(date);
    db.get("SELECT userid, date, rating FROM ratings WHERE userid == ? AND date == ?", [req.session.userID, numericDate], (err, row) => {
        if (err) {
            console.log(err);
        }
        if (row) {
            res.json(row);
        } else {
            res.end("Not rated yet")
        }
    })
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

router.post("/rate", function(req, res) {
    let dateString = req.body.dateString;
    let rating = req.body.rating;

    //rating should be 1-10
    if (rating < 1 || rating > 10) {
        res.status(400).end("Rating invalid")
    }

    //get date in a proper format
    let date = new Date(dateString);
    let numericDateString = getNumericDate(date)

    //insert it into the table or replace it if a rating for today already exists
    db.run('REPLACE INTO ratings(userid, date, rating) VALUES (?, ?, ?)', [req.session.userID, numericDateString, rating], function(err) {
        if (err) {
            console.log(err)
            res.status(409).end("ERROR, rating already exists")
        }
        res.status(200).end("Rating stored")
    })
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

//transfer date object tot proper numeric date such as it is in the db
function getNumericDate(date) {
    return date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
}


//404 page
router.use(function(req, res) {
    res.status(404);
    res.end("404 ERROR")
})

module.exports = router;
