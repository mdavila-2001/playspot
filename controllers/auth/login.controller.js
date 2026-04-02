const bcrypt = require('bcryptjs');
const db = require('../../models');

const loginController = {};

loginController.showLogin = (req, res) => {
    const error = req.session.flashError || null;
    req.session.flashError = null;
    res.render('auth/login', { error, hideNav: true });
};

loginController.login = async (req, res) => {
    try {
        let { email, password } = req.body;
        email = email.toLowerCase().trim();

        const user = await db.User.findOne({ where: { email } });
        if (!user) {
            req.session.flashError = 'Credenciales incorrectas';
            return res.redirect('/login');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            req.session.flashError = 'Credenciales incorrectas';
            return res.redirect('/login');
        }

        req.session.userId = user.id;
        req.session.role = user.role;
        res.redirect('/');
    } catch (error) {
        console.log(error);
        req.session.flashError = 'Error al iniciar sesión';
        res.redirect('/login');
    }
};

loginController.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            return res.redirect('/');
        }
        res.redirect('/login');
    });
};

module.exports = loginController;
