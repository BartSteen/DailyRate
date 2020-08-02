const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser')
const app = express();
const generalRouter = require('./router')

const port = 3000;

//listen at the port
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

//use the router
app.use(generalRouter);
