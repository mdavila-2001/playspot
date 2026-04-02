const { User, Court, Schedule, Booking, Review, sequelize } = require('./models');
const bcrypt = require('bcryptjs');

async function seed() {
    try {
        await sequelize.authenticate();
        console.log("Conectado a la BD para seeder.");

        
        const court = await Court.findOne();
        if (!court) {
            console.log("No hay canchas. Por favor crea una desde el panel admin primero.");
            process.exit(1);
        }
        console.log(`Usando cancha: ${court.name} (ID: ${court.id})`);

        const passwordHash = await bcrypt.hash('cliente123', 10);
        const [client, createdUser] = await User.findOrCreate({
            where: { email: 'cliente@ejemplo.com' },
            defaults: {
                name: 'Usuario Cliente Prueba',
                email: 'cliente@ejemplo.com',
                password: passwordHash,
                role: 'client'
            }
        });
        console.log(createdUser ? 'Usuario cliente creado.' : 'ℹUsuario ya existía.');

        const todayStr = new Date().toISOString().split('T')[0];
        
        let schedule1 = await Schedule.findOne({ where: { court_id: court.id, start_time: '18:00:00' } });
        if (!schedule1) {
            schedule1 = await Schedule.create({
                court_id: court.id,
                fecha: todayStr,
                start_time: '18:00:00',
                end_time: '19:00:00',
                disponible: false
            });
            console.log('Horario 1 (reservado) creado.');
        } else {
            await schedule1.update({ disponible: false });
        }

        let schedule2 = await Schedule.findOne({ where: { court_id: court.id, start_time: '19:00:00' } });
        if (!schedule2) {
            schedule2 = await Schedule.create({
                court_id: court.id,
                fecha: todayStr,
                start_time: '19:00:00',
                end_time: '20:00:00',
                disponible: true
            });
            console.log('Horario 2 (disponible) creado.');
        }

        const [booking, createdBooking] = await Booking.findOrCreate({
            where: { schedule_id: schedule1.id, date: todayStr, user_id: client.id },
            defaults: {
                date: todayStr,
                status: 'confirmed',
                schedule_id: schedule1.id,
                user_id: client.id
            }
        });
        console.log(createdBooking ? 'Reserva creada.' : 'ℹReserva ya existía.');

        const [review, createdReview] = await Review.findOrCreate({
            where: { user_id: client.id, court_id: court.id },
            defaults: {
                rating: 5,
                comment: '¡Excelente cancha! Las instalaciones están en perfectas condiciones y la iluminación es ideal para jugar de noche. 100% recomendado.',
                user_id: client.id,
                court_id: court.id
            }
        });
        console.log(createdReview ? 'Reseña creada.' : 'ℹReseña ya existía.');

        console.log("Seeding finalizado con éxito.");
        process.exit(0);

    } catch (error) {
        console.error("Error en seeder:", error);
        process.exit(1);
    }
}

seed();
