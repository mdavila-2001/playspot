const bcrypt = require('bcryptjs');
const db = require('../../models');

const registerController = {};

registerController.showRegister = (req, res) => {
    const error = req.session.flashError || null;
    req.session.flashError = null;
    res.render('auth/register', { error, hideNav: true });
};

registerController.register = async (req, res) => {
    try {
        let { name, email, password, confirmPassword, role } = req.body;

        if (password !== confirmPassword) {
            req.session.flashError = 'Las contraseñas no coinciden';
            return res.redirect('/register');
        }

        email = email.toLowerCase().trim();

        const existingUser = await db.User.findOne({ where: { email } });
        if (existingUser) {
            req.session.flashError = 'El correo ya está registrado';
            return res.redirect('/register');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await db.User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'client'
        });

        res.redirect('/login');
    } catch (error) {
        console.log(error);
        req.session.flashError = 'Error al registrar el usuario';
        res.redirect('/register');
    }
};

module.exports = registerController;
