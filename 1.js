const dotenv = require('dotenv');
const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const db = require('./database/db');
const Task = require('./Task').Task;
const Status = require('./Task').Status;

dotenv.config();

let id = 3;

const app = express();
app.set('view engine', 'ejs');
app.set('views', process.env.VIEWS);
app.use(express.static(path.join(__dirname, process.env.STATIC)));
app.get('/', async (req, res) => {
    const rows = (await db.query('SELECT * FROM task')).rows;
    const tasks = [];
    for (let i = 0; i < rows.length; i++) {
        tasks.push(new Task(
            rows[i]['id'],
            rows[i]['name'],
            rows[i]['status'],
            new Date(rows[i]['date']),
        ));
    }

    console.log(tasks);
    res.render('main', { a : tasks });
})

app.post('/', bodyParser.urlencoded(), async (req, res) => {
    console.log(req.body);
    id += 1;
    let date = req.body.date.split('-');
    let t = await db.query('INSERT INTO task (name, date, status) values ($1, $2, $3)', 
        [ req.body.name, new Date(date[0], date[1], date[2]), Status.Created]);

    console.log(t);
    res.redirect('/');
});

app.listen(4455, () => {
    console.log(`server started on ${process.env.PORT} port`);
});