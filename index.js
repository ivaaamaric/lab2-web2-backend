//setup
const { query } = require('express')
const express = require('express')
const app = express()
const port = 3001

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

const getAllUsers = () => {
    return new Promise(function (resolve, reject) {
        pool.query('SELECT * FROM users', (error, results) => {
            if (error) {
                reject(error)
            }
            //resolve(results.rows);
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
app.get('/', async (req, res) => {
    res.status(200).send("ok");
})

app.post("/post", (req, res) => {
    console.log("Connected to React");
    res.redirect("/");
})