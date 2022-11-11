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

const Login = sequelize.define("Login", {
    email: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    password: {
        type: DataTypes.STRING,
    },
    token: {
        type: DataTypes.STRING,
    }
});

const unsafeLogin = sequelize.define("unsafeLogin", {
    email: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    password: {
        type: DataTypes.STRING,
    }
});

sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
    User.addCol
}).catch((error) => {
    console.error('Unable to connect to the database: ', error);
});

sequelize.sync().then(() => {
    console.log('All tables created successfully!');
}).catch((error) => {
    console.error('Unable to create table : ', error);
});

//http methods
let fs = require('fs');

const NodeRSA = require('node-rsa');
const key = new NodeRSA({ b: 512 });

app.get('/', async (req, res) => {
    user = null
    for (i = 0; i < 20; i++) {
        User.destroy({ where: { id: i } })
        User.create({
            id: i,
            username: "user" + String(i),
            dob: "2022-10-10",
            email: "mail@mail"
        })
    }
    unsafeLogin.destroy({ where: { email: "user@user" } })
    unsafeLogin.create({
        email: "user@user",
        password: "password123"
    })
    Login.destroy({ where: { email: "user@user" } })
    Login.create({
        email: "user@user",
        password: key.encrypt("dKdLru9BZ6ArqAz5", 'base64')
    })
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

var user = null
app.post("/login/safe", bouncer.block, function (req, res) {
    const data = req.body;
    Login.findOne({
        where: {
            email: data.email
        }
    }).then(value => {
        if (value.length == 0) {
            res.send("Invalid email or password")
            user = null
            return
        }
        if (data.password != key.decrypt(value.password, 'utf8')) {
            user = null
            res.send("Invalid email or password")
            return
        }
        bouncer.reset(req);
        if (req.body['g-recaptcha-response'] === undefined
            || req.body['g-recaptcha-response'] === ''
            || req.body['g-recaptcha-response'] === null) {
            return res.json({ "responseCode": 1, "responseDesc": "Please select captcha" });
        }
        var secretKey = "6Lez9vgiAAAAAJBWfCUwU7JwMejjeTVNvyYb_hxw";
        var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret="
            + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.socket.remoteAddress;
        request(verificationUrl, function (error, response, body) {
            body = JSON.parse(body);
            if (body.success !== undefined && !body.success) {
                user = null
                return res.send("Not logged in :(")
            }
            let email = value.email
            const token = jwt.sign(
                { user_id: email },
                "randomString",
                {
                    expiresIn: "2h",
                }
            );
            user = value
            user.token = token;
            return res.redirect("/private")
        });
    }).catch(err => {
        res.send("Invalid email or password")
        user = null
    })
});

var jwt = require("jsonwebtoken")

const verifyToken = (req, res, next) => {
    const token =
        req.body.token || req.query.token || req.headers["x-access-token"] || user.token;

    if (!token) {
        return res.status(403).send("A token is required for access to private content");
    }
    try {
        const decoded = jwt.verify(token, "randomString");
        req.user = decoded;
    } catch (err) {
        return res.status(401).send("Invalid Token");
    }
    return next();
};

app.get('/private', verifyToken, (req, res) => {
    res.status(200).send("Welcome " + user.email + "! :) " + "Shhh! Private content!");
})

app.post("/login/unsafe", function (req, res) {
    const data = req.body;
    unsafeLogin.findOne({
        where: {
            email: data.email
        }
    }).then(value => {
        if (value.length == 0) {
            res.send("Invalid email entered!")
        } else {
            if (value.password != data.password) {
                res.send("Invalid password entered!")
                return
            }
            res.send("Logged in :)")
        }
    }).catch(err => {
        res.send("Invalid email entered!")
    })
});