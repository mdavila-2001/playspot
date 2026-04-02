const db = require('../../models');
const { Op } = require('sequelize');

const catalogController = {};

catalogController.getCatalog = async (req, res) => {
    try {
        if (!req.session.userId) return res.redirect('/login');
        const currentUser = await db.User.findByPk(req.session.userId);

        const selectedDate = req.query.date;

        const courts = await db.Court.findAll({
            where: { is_active: true },
            include: [
                {
                    model: db.CourtType,
                    as: 'type',
                    required: false
                },
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
            for (const court of courts) {
                const applicableSlots = court.schedules.filter(s => {
                    if (!s.fecha) return false;
                    try {
                        let dateStr = '';
                        if (typeof s.fecha === 'string') {
                            dateStr = s.fecha;
                        } else if (s.fecha instanceof Date) {
                            if (Number.isNaN(s.fecha.valueOf())) return false;
                            dateStr = s.fecha.toISOString();
                        } else {
                            dateStr = String(s.fecha);
                        }
                        return dateStr.includes(selectedDate);
                    } catch {
                        return false;
                    }
                });

                const takenSlotIds = new Set((await db.Booking.findAll({
                    where: {
                        status: { [Op.ne]: 'cancelled' },
                        schedule_id: { [Op.in]: applicableSlots.map(s => s.id) }
                    },
                    attributes: ['schedule_id']
                })).map(b => b.schedule_id));

                court.availableSchedules = applicableSlots
                    .map(s => ({ ...s.toJSON(), isAvailable: !takenSlotIds.has(s.id) && s.disponible }))
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

        res.render('client/catalog/catalog', { user: currentUser, courts, selectedDate: selectedDate || '' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno mostrando catálogo');
    }
};

module.exports = catalogController;
