const db = require('../models');

exports.getCatalog = async (req, res) => {
    try {
        if (!req.session.userId) return res.redirect('/login');
        const currentUser = await db.User.findByPk(req.session.userId);

        const selectedDate = req.query.date;
        let courts = [];

        if (selectedDate) {
            courts = await db.Court.findAll({
                include: [
                    { model: db.Schedule, as: 'schedules', where: { date: selectedDate, isAvailable: true }, required: false },
                    { model: db.Review, as: 'reviews', required: false }
                ]
            });
        } else {
            courts = await db.Court.findAll({
                include: [{ model: db.Review, as: 'reviews', required: false }]
            });
        }

        courts.forEach(court => {
            if (court.schedules) court.schedules.sort((a,b) => a.startTime.localeCompare(b.startTime));
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
        const schedule_id = req.body.schedule_id;
        
        const schedule = await db.Schedule.findByPk(schedule_id);
        if (!schedule || !schedule.isAvailable) {
            return res.status(400).send("Turno no disponible o ya fue tomado.");
        }

        await db.Booking.create({
            user_id: req.session.userId,
            schedule_id: schedule.id,
            status: 'confirmed'
        });
        
        schedule.isAvailable = false;
        await schedule.save();

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
            order: [[{ model: db.Schedule, as: 'schedule' }, 'date', 'DESC']]
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
        const booking = await db.Booking.findByPk(req.params.id, { include: ['schedule'] });
        
        if (booking && booking.user_id === req.session.userId && booking.status === 'confirmed') {
            booking.status = 'cancelled';
            await booking.save();

            booking.schedule.isAvailable = true;
            await booking.schedule.save();
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
            court_id: court_id,
            rating: parseInt(rating),
            comment: comment
        });
        
        res.redirect('/client/bookings?success=review');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error creando reseña");
    }
};
