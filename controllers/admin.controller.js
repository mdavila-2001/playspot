const db = require('../models');

exports.getDashboard = async (req, res) => {
    try {
        if (!req.session.userId || req.session.role !== 'admin') return res.redirect('/');
        const currentUser = await db.User.findByPk(req.session.userId);
        const courts = await db.Court.findAll();
        res.render('admin/dashboard', { user: currentUser, courts });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error interno cargando dashboard");
    }
};

exports.generateSchedules = async (req, res) => {
    try {
        if (!req.session.userId || req.session.role !== 'admin') return res.status(401).send("No autorizado");
        const { court_id, date, start_time, end_time } = req.body;
        
        let currentHour = parseInt(start_time.split(':')[0]);
        const endHour = parseInt(end_time.split(':')[0]);
        const newSchedules = [];

        while (currentHour < endHour) {
            const nextHour = currentHour + 1;
            const formatTime = (h) => `${h.toString().padStart(2, '0')}:00:00`;
            newSchedules.push({ court_id, date, startTime: formatTime(currentHour), endTime: formatTime(nextHour), isAvailable: true });
            currentHour++;
        }

        if (newSchedules.length > 0) await db.Schedule.bulkCreate(newSchedules);
        res.redirect('/admin/dashboard?success=1');
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
            order: [[{ model: db.Schedule, as: 'schedule' }, 'date', 'DESC']]
        });
        res.render('admin/bookings', { user: currentUser, bookings });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error recuperando reservas globales");
    }
};

exports.changeBookingStatus = async (req, res) => {
    try {
        if (!req.session.userId || req.session.role !== 'admin') return res.status(401).send("No admin");
        const { status } = req.body;
        const booking = await db.Booking.findByPk(req.params.id, { include: ['schedule'] });
        
        if (booking) {
            const oldStatus = booking.status;
            booking.status = status;
            await booking.save();
            
            if (status === 'cancelled') {
                booking.schedule.isAvailable = true;
                await booking.schedule.save();
            } else if (oldStatus === 'cancelled' && (status === 'confirmed' || status === 'completed')) {
                booking.schedule.isAvailable = false;
                await booking.schedule.save();
            }
        }
        res.redirect('/admin/bookings?success=status');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error cambiando estado de reserva");
    }
};
