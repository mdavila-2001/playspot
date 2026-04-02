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
