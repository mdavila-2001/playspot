const db = require('../models');
const { Op } = require('sequelize');

exports.getDashboard = async (req, res) => {
    try {
        if (!req.session.userId || req.session.role !== 'admin') return res.redirect('/');
        const currentUser = await db.User.findByPk(req.session.userId);
        const courts = await db.Court.findAll();
        res.render('admin/dashboard/dashboard', { user: currentUser, courts, activePage: 'dashboard' });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error interno cargando dashboard");
    }
};

/**
 * Genera slots de horario (plantilla) para una cancha específica.
 * No genera por fecha: crea slots reutilizables de hora en hora.
 * El campo day_of_week puede ser null (aplica todos los días)
 * o un número 0-6 (solo ese día de la semana).
 */
exports.generateSchedules = async (req, res) => {
    try {
        if (!req.session.userId || req.session.role !== 'admin') return res.status(401).send("No autorizado");
        const { court_id, start_time, end_time, day_of_week } = req.body;

        let currentHour = parseInt(start_time.split(':')[0]);
        const endHour = parseInt(end_time.split(':')[0]);
        const newSchedules = [];

        const formatTime = (h) => `${h.toString().padStart(2, '0')}:00:00`;

        while (currentHour < endHour) {
            const nextHour = currentHour + 1;
            // Evitar duplicados: verificar si ya existe ese slot
            const existing = await db.Schedule.findOne({
                where: {
                    court_id,
                    start_time: formatTime(currentHour),
                    end_time: formatTime(nextHour),
                    day_of_week: day_of_week || null
                }
            });

            if (!existing) {
                newSchedules.push({
                    court_id,
                    start_time: formatTime(currentHour),
                    end_time: formatTime(nextHour),
                    day_of_week: day_of_week ? parseInt(day_of_week) : null
                });
            }
            currentHour++;
        }

        if (newSchedules.length > 0) await db.Schedule.bulkCreate(newSchedules);
        res.redirect('/dashboard?success=1');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error generando horarios");
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        if (!req.session.userId || req.session.role !== 'admin') return res.redirect('/');
        const currentUser = await db.User.findByPk(req.session.userId);

        const bookings = await db.Booking.findAll({
            include: [
                { model: db.User, as: 'user' },
                {
                    model: db.Schedule,
                    as: 'schedule',
                    include: [{ model: db.Court, as: 'court' }]
                }
            ],
            order: [['date', 'DESC']]
        });
        res.render('admin/bookings', { user: currentUser, bookings, activePage: 'bookings' });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error recuperando reservas globales");
    }
};

exports.changeBookingStatus = async (req, res) => {
    try {
        if (!req.session.userId || req.session.role !== 'admin') return res.status(401).send("No admin");
        const { status } = req.body;
        const booking = await db.Booking.findByPk(req.params.id);

        if (booking) {
            booking.status = status;
            await booking.save();
        }
        res.redirect('/admin/bookings?success=status');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error cambiando estado de reserva");
    }
};
