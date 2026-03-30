const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const db = require('./models');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'views')));
app.use(session({
    secret: 'llave-segura-de-playspot',
    resave: false,
    saveUninitialized: false
}));

require('./routes')(app);

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

const seedCourts = async () => {
    try {
        const courtCount = await db.Court.count();
        if (courtCount === 0) {
            const type = await db.CourtType.create({ name: 'Fútbol Sintético' });

            await db.Court.bulkCreate([
                {
                    name: 'Cancha 1 (Premium)',
                    price_per_hour: 2500,
                    court_type_id: type.id,
                    image_url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop'
                },
                {
                    name: 'Cancha 2 (Económica)',
                    price_per_hour: 1500,
                    court_type_id: type.id,
                    image_url: 'https://th.bing.com/th/id/R.8fc66bf6d27863f3d460073fada0a010?rik=zIJB7r8GDtQO9g&riu=http%3a%2f%2frecreasport.com%2fwp-content%2fuploads%2f2017%2f04%2fSAM_0191-2.jpg&ehk=rT6Sfqu7OrTaehM4mOpmuNXz9P0aDr%2fehMicFv5kPFo%3d&risl=&pid=ImgRaw&r=0'
                },
                {
                    name: 'Cancha VIP Techada',
                    price_per_hour: 3500,
                    court_type_id: type.id,
                    image_url: 'https://tse2.mm.bing.net/th/id/OIP.fw-QF9R0YfhIYJAub2PLgAHaEl?rs=1&pid=ImgDetMain&o=7&rm=3'
                }
            ]);
            console.log('Canchas de prueba creadas exitosamente');
        }
    } catch (error) {
        console.log('Error creando canchas de prueba:', error);
    }
};

db.sequelize.sync().then(async () => {
    console.log('Base de datos conectada');
    await seedAdmin();
    await seedCourts();
    app.listen(port, () => console.log(`Servidor en http://localhost:${port}`));
});