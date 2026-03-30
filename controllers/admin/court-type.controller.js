const db = require('../../models');

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

        const courtTypes = await db.CourtType.findAll({ order: [['createdAt', 'DESC']] });
        
        res.render('admin/court-types/index', { 
            courtTypes, 
            user: currentUser,
            activePage: 'court-types'
        });
    } catch (error) {
        console.error('Error al listar tipos de cancha:', error);
        res.status(500).send('Error interno del servidor');
    }
};

exports.create = async (req, res) => {
    try {
        const currentUser = await getAdminUser(req, res);
        if (!currentUser) return;

        res.render('admin/court-types/form', { 
            courtType: {}, 
            user: currentUser,
            activePage: 'court-types'
        });
    } catch (error) {
        console.error('Error al cargar formulario:', error);
        res.status(500).send('Error interno del servidor');
    }
};

exports.store = async (req, res) => {
    try {
        const currentUser = await getAdminUser(req, res);
        if (!currentUser) return;

        const { name } = req.body;
        if (!name || name.trim() === '') {
            return res.render('admin/court-types/form', { 
                courtType: { name }, 
                user: currentUser,
                activePage: 'court-types',
                error: 'El nombre es obligatorio'
            });
        }

        await db.CourtType.create({ name });
        res.redirect('/admin/court-types');
    } catch (error) {
        console.error('Error al crear tipo de cancha:', error);
        res.status(500).send('Error interno del servidor');
    }
};

exports.edit = async (req, res) => {
    try {
        const currentUser = await getAdminUser(req, res);
        if (!currentUser) return;

        const courtType = await db.CourtType.findByPk(req.params.id);
        if (!courtType) return res.redirect('/admin/court-types');

        res.render('admin/court-types/form', { 
            courtType, 
            user: currentUser,
            activePage: 'court-types'
        });
    } catch (error) {
        console.error('Error al cargar formulario de edición:', error);
        res.status(500).send('Error interno del servidor');
    }
};

exports.update = async (req, res) => {
    try {
        const currentUser = await getAdminUser(req, res);
        if (!currentUser) return;

        const { name } = req.body;
        const courtType = await db.CourtType.findByPk(req.params.id);
        
        if (!courtType) return res.redirect('/admin/court-types');

        if (!name || name.trim() === '') {
            return res.render('admin/court-types/form', { 
                courtType: { ...courtType.toJSON(), name }, 
                user: currentUser,
                activePage: 'court-types',
                error: 'El nombre es obligatorio'
            });
        }

        courtType.name = name;
        await courtType.save();
        res.redirect('/admin/court-types');
    } catch (error) {
        console.error('Error al actualizar tipo de cancha:', error);
        res.status(500).send('Error interno del servidor');
    }
};

exports.destroy = async (req, res) => {
    try {
        const currentUser = await getAdminUser(req, res);
        if (!currentUser) return;

        const courtType = await db.CourtType.findByPk(req.params.id);
        if (!courtType) return res.redirect('/admin/court-types');

        // Verify if courttype is in use
        const boundCourtsCount = await db.Court.count({ where: { court_type_id: courtType.id } });
        if (boundCourtsCount > 0) {
            const courtTypes = await db.CourtType.findAll({ order: [['createdAt', 'DESC']] });
            return res.render('admin/court-types/index', { 
                courtTypes, 
                user: currentUser,
                activePage: 'court-types',
                error: 'No se puede eliminar porque hay canchas usando esta categoría.'
            });
        }

        await courtType.destroy();
        res.redirect('/admin/court-types');
    } catch (error) {
        console.error('Error al borrar tipo de cancha:', error);
        res.status(500).send('Error interno del servidor');
    }
};
