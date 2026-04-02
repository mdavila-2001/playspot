const db = require('../../models');
const { Op } = require('sequelize');

const bookingController = {};

bookingController.createBooking = async (req, res) => {
    try {
        if (!req.session.userId) return res.redirect('/login');
        let { schedule_ids } = req.body;

        if (!schedule_ids) return res.status(400).send('No seleccionaste ningún turno.');

        if (!Array.isArray(schedule_ids)) {
            schedule_ids = [schedule_ids];
        }

        for (const id of schedule_ids) {
            const schedule = await db.Schedule.findByPk(id);
            if (!schedule) continue;

            const existingBooking = await db.Booking.findOne({
                where: {
                    schedule_id: id,
                    date: schedule.fecha,
                    status: { [Op.ne]: 'cancelled' }
                }
            });

            if (!existingBooking) {
                await db.Booking.create({
                    user_id: req.session.userId,
                    schedule_id: id,
                    date: schedule.fecha,
                    status: 'confirmed'
                });
            }
        }

        res.redirect('/client/bookings?success=booking');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creando reserva');
    }
};

bookingController.getMyBookings = async (req, res) => {
    try {
        if (!req.session.userId) return res.redirect('/login');
        const currentUser = await db.User.findByPk(req.session.userId);

        const bookings = await db.Booking.findAll({
            where: { user_id: req.session.userId },
            include: [
                {
                    model: db.Schedule,
                    as: 'schedule',
                    include: [{ model: db.Court, as: 'court' }]
                }
            ],
            order: [['date', 'DESC']]
        });

        const activeBookings = bookings.filter(b => b.status === 'confirmed');
        const pastBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

        res.render('client/bookings/bookings', { user: currentUser, activeBookings, pastBookings });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno cargando historial');
    }
};

bookingController.cancelBooking = async (req, res) => {
    try {
        if (!req.session.userId) return res.redirect('/login');
        const booking = await db.Booking.findByPk(req.params.id);

        if (booking && booking.user_id === req.session.userId && booking.status === 'confirmed') {
            booking.status = 'cancelled';
            await booking.save();
        }
        res.redirect('/client/bookings?success=cancel');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al cancelar');
    }
};

module.exports = bookingController;
