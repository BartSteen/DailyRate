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
