const express = require("express");
const keys = require("./keys");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());


//POSTGRES setup
const {Pool} = require('pg');
const pgClient = new Pool({
    user: keys.pgUser,
    database: keys.pgDatabase,
    host: keys.pgHost,
    port: keys.pgPort,
    password: keys.pgPassword
});

pgClient.on('error', () => console.log('Lost PG connection'));
pgClient
    .query('CREATE TABLE IF NOT EXISTS values (number  INT)')
    .catch(err => console.log(err));

//REDIS setup
const redis = require("redis");

const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});

const redisPublisheer = redisClient.duplicate();

//EXPRESS handlers
app.get('/', (req,res) => {
    res.send('Hi');
});

app.get('/values/all', async (req,res) => {
    const values = await pgClient.query('SELECT * from values');
    res.send(values.rows);
});

app.get('/values/current', async (req, res) => {
    redisClient.hgetall('values', (err, values) => {
        res.send(values);
    });
});

app.post('/values', async (req, res) => {
    const index = req.body.index;
    if(parseInt(index) >= 40){
        res.status(422).send('Index too high');
    }

    redisClient.hset('values', index, 'Nothing yet!');
    redisPublisheer.publish('insert', index);
    pgClient.query('INSERT INTO values (number) VALUES($1)', [index]);

    res.send({working: true});
});

app.listen(5000, err => {
    console.log('Listening ...');
});
