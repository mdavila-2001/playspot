const express  = require('express');
const path     = require('path');
const session  = require('express-session');
const bcrypt   = require('bcryptjs');
const bodyParser = require('body-parser');
const db = require('./models');

const app  = express();
const port = 3001;

// ─── View Engine ────────────────────────────────────────────────
app.set('view engine', 'ejs');

// ─── Middleware ───────────────────────────────────────────────────
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'views')));
app.use(session({
    secret: 'llave-segura-de-playspot',
    resave: false,
    saveUninitialized: false
}));

// ─── Rutas ───────────────────────────────────────────────────────
require('./routes')(app);

// ─── Base de datos + Seed ────────────────────────────────────────
const seedAdmin = async () => {
    try {
        const adminExists = await db.User.findOne({ where: { role: 'admin' } });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('12345678', 10);
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
        console.log('Error creando al admin:', error);
    }
};

db.sequelize.sync().then(async () => {
    console.log('Base de datos conectada');
    await seedAdmin();
    app.listen(port, () => console.log(`Servidor en http://localhost:${port}`));
});