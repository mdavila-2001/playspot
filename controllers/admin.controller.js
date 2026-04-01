const db = require('../models');
const { Op } = require('sequelize');

exports.getDashboard = async (req, res) => {
    try {
        if (!req.session.userId || req.session.role !== 'admin') return res.redirect('/');
        const currentUser = await db.User.findByPk(req.session.userId);
        
        const allBookings = await db.Booking.findAll({
            where: { 
                status: { [Op.in]: ['confirmed', 'completed'] } 
            },
            include: [{
                model: db.Schedule,
                as: 'schedule',
                include: [{ model: db.Court, as: 'court' }]
            }]
        });
        
        const totalRevenue = allBookings.reduce((sum, b) => {
            return sum + parseFloat(b.schedule?.court?.price_per_hour || 0);
        }, 0);

        const activeCourtsCount = await db.Court.count({ where: { is_active: true } });

        const clientsCount = await db.User.count({ where: { role: 'client' } });

        const latestBookings = await db.Booking.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']],
            include: [
                { model: db.User, as: 'user', attributes: ['name', 'email'] },
                {
                    model: db.Schedule,
                    as: 'schedule',
                    include: [{ model: db.Court, as: 'court' }]
                }
            ]
        });

        const stats = {
            totalRevenue,
            activeCourtsCount,
            clientsCount
        };

        res.render('admin/dashboard/dashboard', { 
            user: currentUser, 
            activePage: 'dashboard',
            stats,
            latestBookings
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error interno cargando dashboard");
    }
};

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
