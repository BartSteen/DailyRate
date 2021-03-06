var express = require('express');
const sqlhandler = require("./sqlhandler.js")
var router = express.Router();
const bcrypt = require('bcrypt');
const formidable = require('formidable');
const fs = require('fs');
const saltRounds = 10;

//open db
sqlhandler.openConnection();

//log all requests
router.use((req, res, next) => {
    console.log(req.method + " request made for " + req.url);
    next();
})

//main access only if the user is logged in
router.get("/main", function(req, res, next) {
    if (req.session.loggedin) {
        next();
    } else {
        res.redirect("/login")
    }
})

//main access only if the user is logged in
router.get("/account", function(req, res, next) {
    if (req.session.loggedin) {
        next();
    } else {
        res.redirect("/login")
    }
})


router.get("/analyze", function(req, res, next) {
    if (req.session.loggedin) {
        next();
    } else {
        res.redirect("/login")
    }
})
//retrieve username
router.get("/user", async function (req, res) {
    if (req.session.loggedin) {
        const result = await sqlhandler.singleResQuery("SELECT id, username FROM users WHERE id == ?", [req.session.userID]);
        res.json(result);
    } else {
        res.end("Error, not logged in")
    }
})

//retrieve rating on a specific date
router.get("/rate", async function(req, res) {
    let date = new Date(req.query.dateString);
    let numericDate = getNumericDate(date);

    const result = await sqlhandler.singleResQuery("SELECT userid, date, rating FROM ratings WHERE userid == ? AND date == ?", [req.session.userID, numericDate])
    if (result) {
        res.json(result);
    } else {
        res.end("Not rated yet")
    }
})

//retrieve rating of all dates filled
router.get("/allratings", async function(req, res) {
    const result = await sqlhandler.allResQuery('SELECT date, rating FROM ratings where userid == ?', [req.session.userID]);
    if (result) {
        res.json(result);
    } else {
        res.end();
    }
})

//direct to login page or redirect if user is already logged in
router.get("/login", function(req, res, next) {
    if (req.session.loggedin) {
        res.redirect("/main");
    } else {
        next();
    }
})

//logout by destroying the session
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

//check if posted password is incorrect
router.post("/changepw", async function(req, res) {
    let oldPw = req.body.oldPw;
    let newPw = req.body.newPw;
    if (await comparePassword(oldPw, req.session.userID)) {
        //old pw correct so update
        const hash = await bcrypt.hash(newPw, saltRounds)
        let result = await sqlhandler.actionQuery('UPDATE users SET password = ? WHERE id == ?', [hash, req.session.userID]);
        res.status(200).end("It's a match");
    } else {
        res.status(401).end("Does not match")
    }
})

router.post("/deleteAccount", async function(req, res) {
    let password = req.body.password;
    if (await comparePassword(password, req.session.userID)) {
        await sqlhandler.actionQuery('DELETE FROM ratings WHERE userid == ?', [req.session.userID]);
        await sqlhandler.actionQuery('DELETE FROM users WHERE id == ?', [req.session.userID]);
        req.session.destroy();
        res.status(200).end("it is done");
    } else {
        res.status(401).end("incorrect password")
    }
})

//post rating to the db
router.post("/rate", async function(req, res) {
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
    const result = await sqlhandler.actionQuery('REPLACE INTO ratings(userid, date, rating) VALUES (?, ?, ?)', [req.session.userID, numericDateString, rating]);
    res.status(200).end("Rating stored")
})

//remove the rating specified in the request
router.post("/removeRating", async function(req, res) {
    //get the date from the request
    let dateString = req.body.dateString;
    let date = new Date(dateString);

    //remove it from the db
    await sqlhandler.actionQuery('DELETE FROM ratings WHERE userid == ? AND date == ?', [req.session.userID, getNumericDate(date)])
    res.status(200).end("Rating removed");
})

router.post("/importRatings", function(req, res) {
    let form = formidable({keepExtensions: true})
    form.parse(req, async function(err, fields, file) {
            let data = await fs.readFileSync(file['importFileButton'].path, 'utf-8')
            //parse the strings
            let lines = data.split('\n');
            for (i = 0; i < lines.length; i++) {
                //skip empty line at the end
                if (lines[i] == "") {
                    continue;
                }
                let lineSplit = lines[i].split(",") //first elem is date, second is rating

                //checking for good format
                //check if there are two elements
                if (!lineSplit[1]) {
                    continue;
                }
                let date = lineSplit[0];
                let rating = lineSplit[1];

                //check if rating is an proper int in the range 1-10
                if (!(rating >= 1 && rating <= 10) || parseInt(rating) != rating) {
                    res.status(400).end("Wrong format in rating")
                    return;
                }

                //check if it is a proper date
                let dateParts = date.split("-");
                if (isNaN(dateParts[0]) || isNaN(dateParts[1]) || isNaN(dateParts[2])) {
                    res.status(400).end("Wrong format in date")
                    return;
                }

                //put it in the db
                let result = await sqlhandler.actionQuery('REPLACE INTO ratings(userid, date, rating) VALUES (?,?,?)', [req.session.userID, date, rating]);
            }

            res.redirect('/account')
            //res.status(200).end("Succesfully added")
    })
})

//attempts a login with the username and password and handles the response
async function attemptLogin(username, password, res, req) {
    const result = await sqlhandler.singleResQuery('SELECT * FROM users WHERE username == ?', [username]);
    if (result) {
        const match = await bcrypt.compare(password, result.password);
        if (match) {
            req.session.loggedin = true;
            req.session.userID = result.id;
            res.status(200).end("Succesfully logged in with id " + result.id);
        } else {
            res.status(401).end("Failed login (incorrect password)");
        }
    } else {
        res.status(401).end("Failed login ");
    }
}


async function attemptRegister(username, password, res) {
    //hash passwords
    const hash = await bcrypt.hash(password, saltRounds)
    //attempt to register
    const result = await sqlhandler.allResQuery('SELECT * FROM users WHERE username == ?', [username]);
    if (result.length > 0) {
        res.status(409).end("Username not available");
    } else {
        const otherResult = await sqlhandler.actionQuery('INSERT INTO users(username, password) VALUES (?, ?)', [username, hash]);
        res.status(201).end("Account created with username " + username)
    }
}

//compares password in the parameter with the currently logged in user password
async function comparePassword(password, uid) {
    //get the user row
    const result = await sqlhandler.singleResQuery('SELECT * FROM users WHERE id == ?', [uid]);
    const match =  await bcrypt.compare(password, result.password);
    return match;
}

//transfer date object tot proper numeric date such as it is in the db
function getNumericDate(date) {
    return date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
}


//404 page
router.use(function(req, res) {
    res.status(404);
    res.sendFile(__dirname + "/public/404.html")
})

module.exports = router;
