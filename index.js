//setup
const express = require('express')
const app = express()
const port = 3001
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})

//database
const { Client } = require('pg')
const client = new Client({
    user: 'lab2_web2_user',
    host: 'pg-cdjbjjsgqg433fds9qc0-a.oregon-postgres.render.com',
    database: 'lab2_web2',
    password: 'KDd8PeRgFDdwZQroSQy4FCxEEsYwMQiE',
    port: 5432,
    ssl: true
})

client.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize('postgres://lab2_web2_user:KDd8PeRgFDdwZQroSQy4FCxEEsYwMQiE@dpg-cdjbjjsgqg433fds9qc0-a.oregon-postgres.render.com/lab2_web2?ssl=true');


const User = sequelize.define("users", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    dob: {
        type: DataTypes.DATEONLY,
    },
    email: {
        type: DataTypes.STRING,
    }
});

sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
}).catch((error) => {
    console.error('Unable to connect to the database: ', error);
});

sequelize.sync().then(() => {
    console.log('Users table created successfully!');
}).catch((error) => {
    console.error('Unable to create table : ', error);
});

//http methods
let fs = require('fs');

app.get('/', async (req, res) => {
    for (i = 0; i < 20; i++) {
        User.destroy({ where: { id: i } })
        User.create({
            id: i,
            username: "user" + String(i),
            dob: "2022-10-10",
            email: "mail@mail"
        })
    }
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
    fs.readFile('./index.html', null, function (error, data) {
        if (error) {
            res.writeHead(404);
            res.write('Whoops! File not found!');
        } else {
            res.write(data);
        }
        res.end();
    });
})

app.post('/tautology', async (req, res) => {
    const data = req.body;

    if (data.safe) return safeQuery(req, res)

    const query = `SELECT * FROM users WHERE id = ${data.password}`;
    client.query(query, (err, rows) => {
        if (err) {
            res.send(err)
            return
        }
        res.json({ data: rows.rows });
    });
})

app.post('/info', async (req, res) => {
    const data = req.body;

    if (data.safe) return safeQuery(req, res)

    const query = `SELECT email, dob FROM users WHERE id = ${data.password}`;
    client.query(query, (err, rows) => {
        if (err) {
            res.send(err)
            return
        }
        res.json({ data: rows.rows });
    });
})

app.post('/blind', async (req, res) => {
    const data = req.body;

    if (data.safe) return safeQuery(req, res)

    const query = `SELECT id FROM users WHERE id = ${data.password}`;
    client.query(query, (err, rows) => {
        if (err) {
            res.send(err)
            return
        }
        res.json({ data: rows.rows });
    });
})

app.post('/union', async (req, res) => {
    const data = req.body;

    if (data.safe) return safeQuery(req, res)

    const query = `SELECT username, id FROM users WHERE id = ${data.password}`;
    client.query(query, (err, rows) => {
        if (err) {
            res.send(err)
            return
        }
        res.json({ data: rows.rows });
    });
})

app.post('/chaining', async (req, res) => {
    const data = req.body;

    if (data.safe) return safeQuery(req, res)

    const query = `SELECT id FROM users WHERE id = ${data.password}`;
    client.query(query, (err, rows) => {
        if (err) {
            res.send(err)
            return
        }
        res.json({ data: rows.rows });
    });
})

function validInput(input) {
    if (input.match(/^[0-9]+$/)) {
        return true;
    }
    else {
        return false;
    }
}

function safeQuery(req, res) {
    const data = req.body;
    if (!validInput(data.password)) {
        res.send("User id is a numeric value!")
        return
    }
    User.findAll({
        where: {
            id: data.password
        }
    }).then(value => {
        if (value.length == 0) {
            res.send("No user with id:" + data.password)
        } else {
            res.send(value)
        }
    }).catch(err => {
        res.send("No user with id:" + data.password)
    })
}

var bouncer = require("express-bouncer")(500, 900000);
var request = require('request');

bouncer.whitelist.push("127.0.0.1");

bouncer.blocked = function (req, res, next, remaining) {
    res.send(429, "Too many requests have been made, " +
        "please wait " + remaining / 1000 + " seconds");
};

app.post("/login/safe", bouncer.block, function (req, res) {
    // if (LoginFailed) {
    //     res.send("Login failed")
    // } else {
    bouncer.reset(req);
    // g-recaptcha-response is the key that browser will generate upon form submit.
    // if its blank or null means user has not selected the captcha, so return the error.
    if (req.body['g-recaptcha-response'] === undefined
        || req.body['g-recaptcha-response'] === ''
        || req.body['g-recaptcha-response'] === null) {
        return res.json({ "responseCode": 1, "responseDesc": "Please select captcha" });
    }
    // Put your secret key here.
    var secretKey = "6Lez9vgiAAAAAJBWfCUwU7JwMejjeTVNvyYb_hxw";
    // req.connection.remoteAddress will provide IP address of connected user.
    var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret="
        + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.socket.remoteAddress;
    // Hitting GET request to the URL, Google will respond with success or error scenario.
    request(verificationUrl, function (error, response, body) {
        body = JSON.parse(body);
        // Success will be true or false depending upon captcha validation.
        if (body.success !== undefined && !body.success) {
            return res.json({ "not logged in": 500 })
        }
        return res.json({ "logged in": 200 })
    });
    // }
});

app.post("/login/unsafe", function (req, res) {
    res.send("ok")
});