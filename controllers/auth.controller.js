const bcrypt = require('bcryptjs');
const db = require('../models');

const showLogin = (req, res) => {
    const error = req.session.flashError || null;
    req.session.flashError = null;
    res.render('auth/login', { error, hideNav: true });
};

const login = async (req, res) => {
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

const showRegister = (req, res) => {
    const error = req.session.flashError || null;
    req.session.flashError = null;
    res.render('auth/register', { error, hideNav: true });
};

const register = async (req, res) => {
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

const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            return res.redirect('/');
        }
        res.redirect('/login');
    });
};

module.exports = { showLogin, login, showRegister, register, logout };