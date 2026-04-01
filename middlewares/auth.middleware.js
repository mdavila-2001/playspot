const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    next();
};

const requireAdmin = (req, res, next) => {
    if (req.session.role !== 'admin') {
        return res.redirect('/');
    }
    next();
};

const requireClient = (req, res, next) => {
    if (req.session.role !== 'client') {
        return res.redirect('/');
    }
    next();
};

module.exports = {
    requireAuth,
    requireAdmin,
    requireClient
};
