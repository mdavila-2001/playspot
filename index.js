const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const session = require('express-session');
const db = require('./models');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
    secret: 'llave-segura-de-playspot',
    resave: false,
    saveUninitialized: false
}));

require('./controllers/auth.controller')(app, db);

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});