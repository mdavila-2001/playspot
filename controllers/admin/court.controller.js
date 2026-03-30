const db = require('../../models');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/courts/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

exports.getCourts = async (req, res) => {
    try {
        if (!req.session.userId || req.session.role !== 'admin') {
            return res.redirect('/login');
        }

        const currentUser = await db.User.findByPk(req.session.userId);

        const courtsData = await db.Court.findAll({
            include: [{
                model: db.CourtType,
                as: 'type',
                attributes: ['name']
            }],
            order: [['createdAt', 'DESC']]
        });

        const courts = courtsData.map(c => ({
            id: c.id,
            name: c.name,
            image_url: c.image_url,
            price_per_hour: c.price_per_hour,
            is_active: c.is_active,
            type: c.type ? c.type.name : 'Sin categoría'
        }));

        res.render('admin/courts/courts', {
            courts: courts,
            user: currentUser,
            activePage: 'courts'
        });
    } catch (error) {
        console.error('Error al obtener las canchas:', error);
        res.status(500).send('Error interno del servidor');
    }
};

exports.createCourt = async (req, res) => {
    try {
        const { name, court_type_id, price_per_hour, is_active } = req.body;

        const image_url = req.file ? `/uploads/courts/${req.file.filename}` : null;

        await db.Court.create({
            name: name,
            court_type_id: court_type_id,
            price_per_hour: parseFloat(price_per_hour),
            is_active: is_active === 'on',
            image_url: image_url
        });

        res.redirect('admin/courts/courts');
    } catch (error) {
        console.error('Error al crear la cancha:', error);
        res.status(500).send('Error interno del servidor');
        res.redirect('admin/courts/courts/add');
    }
}
    