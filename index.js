//setup
const { query } = require('express')
const express = require('express')
const app = express()
const port = 3001

app.use(express.json())
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers');
    next();
})

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})

//database
const Pool = require('pg').Pool
const pool = new Pool({
    user: 'lab2_web2_user',
    host: 'dpg-cdjbjjsgqg433fds9qc0-a',
    database: 'lab2_web2',
    password: 'KDd8PeRgFDdwZQroSQy4FCxEEsYwMQiE',
    port: 5432,
})

const getAllUsers = () => {
    return new Promise(function (resolve, reject) {
        pool.query('SELECT * FROM users', (error, results) => {
            if (error) {
                reject(error)
            }
            resolve(results.rows);
        })
    })
}

const insertUser = () => {
    var query = "CREATE TABLE users (id int, name varchar(255), email varchar(255);"
    return new Promise(function (resolve, reject) {
        pool.query(query, (error, results) => {
            if (error) {
                reject(error)
            }
            //resolve(results.rows);
        })
    })
}

//http methods
app.get('/', (req, res) => {
    insertUser()
        .then(response => {
            res.status(200).send(response);
        })
        .catch(error => {
            res.status(500).send(error);
        })
})

app.post("/post", (req, res) => {
    console.log("Connected to React");
    res.redirect("/");
})