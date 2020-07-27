const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const bodyParser = require('body-parser')
const app = express();
const generalRouter = require('./router')

const port = 3000;
/*
//open db
let db = new sqlite3.Database("mydb.db", sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.log(err);
    }
    console.log("Connected")
});
*/
app.listen(port, () => console.log("Listening at port " + port));

// initialize body-parser to parse incoming parameters requests to req.body
app.use(bodyParser.urlencoded({ extended: true }));

//sesssion stuff
app.use(session({
    //session key
    secret: 'Vinkega',
    //forces session to be saved in store
    resave: true,
    //forces uninitialized sessions to be saved in store
    saveUninitialized: true
}))

app.use(generalRouter);
/*
//log all requests
app.use((req, res, next) => {
    console.log(req.method + " request made for " + req.url);
    next();
})

//admin redirect only if the user is logged in
app.get("/admin", function(req, res, next) {
    if (req.session.loggedin) {
        next();
    } else {
        res.redirect("/login")
    }
})

app.get("/user", function (req, res) {
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

app.get("/login", function(req, res, next) {
    if (req.session.loggedin) {
        res.redirect("/admin");
    } else {
        next();
    }
})

app.get("/logout", function(req, res) {
    if (req.session.loggedin) {
        req.session.destroy();
    }
    res.end("OK");
})

//static folder with default html extension
app.use(express.static('public', {
    extensions: ['html']
}))


//handle login request
app.post("/login", function(req, res) {
    let username = req.body.username;
    let password = req.body.password;
    attemptLogin(username, password, res, req);
})

//handle register request
app.post("/register", function(req, res) {
    let username = req.body.username;
    let password = req.body.password;
    if (username == "" || password== "") {
        res.end("Error: no username or password");
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
            res.end("Succesfully logged in with id " + rows[0].id);
        } else {
            res.end("Failed login (username pw combination does not exist)");
        }
    })
}

function attemptRegister(username, password, res) {
    db.all('SELECT * FROM users WHERE username == ?', [username], (err, rows) => {
        if (err) {
            console.log(err)
        }
        if (rows.length > 0) {
            res.end("Username is not available");
        } else {
            db.run('INSERT INTO users(username, password) VALUES (?, ?)', [username, password], function(err) {
                if (err) {
                    console.log(err)
                }
                res.end("Account created with username " + username)
            });
        }
    })
}

//404 page
app.use(function(req, res) {
    res.status(404);
    res.end("404 ERROR")
})
*/
