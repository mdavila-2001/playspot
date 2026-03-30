const db = require('../../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Validate/create upload directory
const uploadDir = path.join(__dirname, '../../public/uploads/courts');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/courts/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

exports.upload = multer({ storage: storage });

const getAdminUser = async (req, res) => {
    if (!req.session.userId || req.session.role !== 'admin') {
        res.redirect('/login');
        return null;
    }
    return await db.User.findByPk(req.session.userId);
};

exports.index = async (req, res) => {
    try {
        const currentUser = await getAdminUser(req, res);
        if (!currentUser) return;

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

exports.showCreate = async (req, res) => {
    try {
        const currentUser = await getAdminUser(req, res);
        if (!currentUser) return;

        const courtTypes = await db.CourtType.findAll({ order: [['name', 'ASC']] });

        res.render('admin/courts/form', {
            court: {},
            courtTypes,
            user: currentUser,
            activePage: 'courts'
        });
    } catch (error) {
        console.error('Error al cargar formulario:', error);
        res.status(500).send('Error interno del servidor');
    }
};

exports.createCourt = async (req, res) => {
    try {
        const currentUser = await getAdminUser(req, res);
        if (!currentUser) return;

        const { name, court_type_id, price_per_hour, is_active } = req.body;
        const image_url = req.file ? `/uploads/courts/${req.file.filename}` : null;

        await db.Court.create({
            name,
            court_type_id: parseInt(court_type_id) || null,
            price_per_hour: parseFloat(price_per_hour),
            is_active: is_active === 'on' || is_active === 'true',
            image_url
        });

        res.redirect('/admin/courts');
    } catch (error) {
        console.error('Error al crear la cancha:', error);
        res.redirect('/admin/courts/add?error=1');
    }
};

exports.showEdit = async (req, res) => {
    try {
        const currentUser = await getAdminUser(req, res);
        if (!currentUser) return;

        const court = await db.Court.findByPk(req.params.id);
        if (!court) return res.redirect('/admin/courts');

        const courtTypes = await db.CourtType.findAll({ order: [['name', 'ASC']] });

        res.render('admin/courts/form', {
            court,
            courtTypes,
            user: currentUser,
            activePage: 'courts'
        });
    } catch (error) {
        console.error('Error editar cancha:', error);
        res.status(500).send('Error interno del servidor');
    }
};

exports.updateCourt = async (req, res) => {
    try {
        const currentUser = await getAdminUser(req, res);
        if (!currentUser) return;

        const court = await db.Court.findByPk(req.params.id);
        if (!court) return res.redirect('/admin/courts');

        const { name, court_type_id, price_per_hour, is_active } = req.body;

        court.name = name;
        court.court_type_id = parseInt(court_type_id) || null;
        court.price_per_hour = parseFloat(price_per_hour);
        court.is_active = is_active === 'on' || is_active === 'true';

        if (req.file) {
            court.image_url = `/uploads/courts/${req.file.filename}`;
        }

        await court.save();
        res.redirect('/admin/courts');
    } catch (error) {
        console.error('Error al editar la cancha:', error);
        res.redirect(`/admin/courts/edit/${req.params.id}?error=1`);
    }
};

exports.deleteCourt = async (req, res) => {
    try {
        const currentUser = await getAdminUser(req, res);
        if (!currentUser) return;

        const court = await db.Court.findByPk(req.params.id);
        if (court) {
             await court.destroy();
        }
        res.redirect('/admin/courts');
    } catch (error) {
        console.error('Error al borrar la cancha:', error);
        res.status(500).send('Error interno del servidor');
    }
};