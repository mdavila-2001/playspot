const db = require('../../models');

const scheduleController = {};

scheduleController.getSchedules = async (req, res) => {
    try {
        const courts = await db.Court.findAll({ 
            where: { is_active: true } 
        });

        const schedules = await db.Schedule.findAll({
            include: [{ 
                model: db.Court, 
                as: 'court', 
                attributes: ['name'] 
            }],
            order: [
                ['fecha', 'DESC'], 
                ['start_time', 'ASC']
            ]
        });

        res.render('admin/schedules/schedules', {
            userName: req.session.userName || 'Admin',
            activePage: 'schedules',
            courts,
            schedules
        });
    } catch (error) {
        console.error("Error cargando el módulo de horarios:", error);
        res.redirect('/dashboard');
    }
};

scheduleController.generateSchedules = async (req, res) => {
    try {
        const { cancha_id, fecha, start_time, end_time } = req.body;

        let startHour = parseInt(start_time.split(':')[0]);
        let endHour = parseInt(end_time.split(':')[0]);

        const blocksToCreate = [];
        for (let i = startHour; i < endHour; i++) {
            blocksToCreate.push({
                court_id: cancha_id,
                fecha: fecha,
                start_time: `${i.toString().padStart(2, '0')}:00`,
                end_time: `${(i + 1).toString().padStart(2, '0')}:00`,
                disponible: true
            });
        }

        await db.Schedule.bulkCreate(blocksToCreate);

        res.redirect('/admin/schedules');
    } catch (error) {
        console.error("Error generando los bloques de horario:", error);
        res.redirect('/admin/schedules');
    }
};

scheduleController.deleteSchedule = async (req, res) => {
    try {
        await db.Schedule.destroy({ 
            where: { id: req.params.id } 
        });
        res.redirect('/admin/schedules');
    } catch (error) {
        console.error("Error eliminando horario:", error);
        res.redirect('/admin/schedules');
    }
};

module.exports = scheduleController;