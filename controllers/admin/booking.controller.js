const { Booking, User, Schedule, Court } = require('../../models');

const bookingController = {};

bookingController.listBookings = async (req, res) => {
    try {
        const bookings = await Booking.findAll({
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Schedule,
                    as: 'schedule',
                    include: [
                        {
                            model: Court,
                            as: 'court',
                            attributes: ['name', 'price_per_hour']
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        const currentUser = await User.findByPk(req.session.userId);

        const today = new Date().toISOString().split('T')[0];
        
        const stats = {
            earningsToday: 0,
            confirmedCount: 0,
            cancelledCount: 0
        };

        bookings.forEach(b => {
            if (b.status === 'completed' && b.date === today) {
                stats.earningsToday += parseFloat(b.schedule.court.price_per_hour || 0);
            }
            
            if (b.status === 'confirmed') stats.confirmedCount++;
            if (b.status === 'cancelled') stats.cancelledCount++;
        });

        res.render('admin/bookings/bookings', {
            user: currentUser,
            activePage: 'bookings',
            bookings: bookings,
            stats: stats
        });
    } catch (error) {
        console.error("Error al listar reservas:", error);
        res.status(500).send("Error interno del servidor");
    }
};

bookingController.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        await Booking.update(
            { status: status },
            { where: { id: id } }
        );

        res.redirect('/admin/bookings');
    } catch (error) {
        console.error("Error al actualizar reserva:", error);
        res.redirect('/admin/bookings');
    }
};

bookingController.confirmBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findByPk(id);
        
        if (booking && booking.status !== 'cancelled' && booking.status !== 'completed') {
            await booking.update({ status: 'confirmed' });
        }
        
        res.redirect('/admin/bookings');
    } catch (error) {
        console.error("Error al confirmar reserva:", error);
        res.redirect('/admin/bookings');
    }
};

bookingController.completeBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findByPk(id);
        
        if (booking && booking.status === 'confirmed') {
            await booking.update({ status: 'completed' });
        }
        
        res.redirect('/admin/bookings');
    } catch (error) {
        console.error("Error al marcar reserva como completada:", error);
        res.redirect('/admin/bookings');
    }
};

bookingController.cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findByPk(id);
        
        if (booking && booking.status === 'confirmed') {
            await booking.update({ status: 'cancelled' });
        }
        
        res.redirect('/admin/bookings');
    } catch (error) {
        console.error("Error al cancelar reserva:", error);
        res.redirect('/admin/bookings');
    }
};

module.exports = bookingController;