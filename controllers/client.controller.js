const db = require('../models');
const { Op } = require('sequelize');

exports.getCatalog = async (req, res) => {
    try {
        if (!req.session.userId) return res.redirect('/login');
        const currentUser = await db.User.findByPk(req.session.userId);

        const selectedDate = req.query.date;

        const courts = await db.Court.findAll({
            where: { is_active: true },
            include: [
                {
                    model: db.Schedule,
                    as: 'schedules',
                    required: false
                },
                {
                    model: db.Review,
                    as: 'reviews',
                    required: false
                }
            ]
        });

        if (selectedDate) {
            const dateObj = new Date(selectedDate);
            const dayOfWeek = dateObj.getDay();

            for (const court of courts) {
                const applicableSlots = court.schedules.filter(s =>
                    s.day_of_week === null || s.day_of_week === dayOfWeek
                );
                const takenSlotIds = (await db.Booking.findAll({
                    where: {
                        date: selectedDate,
                        status: { [Op.ne]: 'cancelled' },
                        schedule_id: { [Op.in]: applicableSlots.map(s => s.id) }
                    },
                    attributes: ['schedule_id']
                })).map(b => b.schedule_id);

                // Añadir bandera de disponibilidad a cada slot
                court.availableSchedules = applicableSlots
                    .map(s => ({ ...s.toJSON(), isAvailable: !takenSlotIds.includes(s.id) }))
                    .sort((a, b) => a.start_time.localeCompare(b.start_time));
            }
        }

        courts.forEach(court => {
            if (court.reviews && court.reviews.length > 0) {
                const sum = court.reviews.reduce((acc, r) => acc + r.rating, 0);
                court.avgRating = (sum / court.reviews.length).toFixed(1);
            } else {
                court.avgRating = 'Sin reseñas';
            }
        });

        res.render('client/catalog', { user: currentUser, courts, selectedDate: selectedDate || '' });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error interno mostrando catálogo");
    }
};

exports.createBooking = async (req, res) => {
    try {
        if (!req.session.userId) return res.redirect('/login');
        const { schedule_id, date } = req.body;

        // Verificar que el slot existe
        const schedule = await db.Schedule.findByPk(schedule_id);
        if (!schedule) {
            return res.status(400).send("Horario no encontrado.");
        }

        // Verificar que nadie más ya reservó ese slot en esa fecha
        const existingBooking = await db.Booking.findOne({
            where: {
                schedule_id,
                date,
                status: { [Op.ne]: 'cancelled' }
            }
        });

        if (existingBooking) {
            return res.status(400).send("Este horario ya fue reservado para esa fecha.");
        }

        await db.Booking.create({
            user_id: req.session.userId,
            schedule_id,
            date,
            status: 'confirmed'
        });

        res.redirect('/client/bookings?success=booking');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error creando reserva");
    }
};

exports.getMyBookings = async (req, res) => {
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

        res.render('client/bookings', { user: currentUser, activeBookings, pastBookings });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error interno cargando historial");
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        if (!req.session.userId) return res.redirect('/login');
        const booking = await db.Booking.findByPk(req.params.id);

        if (booking && booking.user_id === req.session.userId && booking.status === 'confirmed') {
            booking.status = 'cancelled';
            await booking.save();
            // No necesitamos actualizar isAvailable en Schedule (ya no existe)
            // Ese slot vuelve a estar disponible automáticamente al cancelar
        }
        res.redirect('/client/bookings?success=cancel');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al cancelar");
    }
};

exports.createReview = async (req, res) => {
    try {
        if (!req.session.userId) return res.redirect('/login');
        const { court_id, rating, comment } = req.body;

        await db.Review.create({
            user_id: req.session.userId,
            court_id,
            rating: parseInt(rating),
            comment
        });

        res.redirect('/client/bookings?success=review');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error creando reseña");
    }
};
