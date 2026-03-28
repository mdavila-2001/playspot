const express = require('express');
const app = express();
const port = 3001;
const bodyParser = require('body-parser');
const session = require('express-session');
const bycrypt = require('bcryptjs');
const db = require('./models');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));

const path = require('path');
app.use(express.static(path.join(__dirname, 'views')));

app.use(session({
    secret: 'llave-segura-de-playspot',
    resave: false,
    saveUninitialized: false
}));

require('./controllers')(app, db);

const seedAdmin = async (db) => {
    try {
        const adminExists = await db.User.findOne({ where: { role: 'admin' } });
        
        if (!adminExists) {
            const hashedPassword = await bycrypt.hash('12345678', 10);

            await db.User.create({
                name: 'Admin PlaySpot',
                email: 'admin@playspot.com',
                password: hashedPassword,
                role: 'admin'
            });

            console.log('Admin creado exitosamente');
        } else {
            console.log('El admin ya existe');
        }
    } catch (error) {
        console.log('Error creando al admin: ', error);
    }
}

db.sequelize.sync({
}).then(async () => {
    console.log("¡La base de datos fue conectada correctamente!");
    await seedAdmin(db);
    console.log('Admin para PlaySpot listo para trabajar');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

app.get('/', (req, res) => {
    if (req.session.userId) {
        res.render('index', { user: req.session.user });
    } else {
        res.redirect('/login');
    }
});