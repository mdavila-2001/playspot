const bycrypt = require('bcryptjs');

module.exports = (app,db) => {
    app.get('/register', (req, res) => {
        res.render('auth/register', { error:null, hideNav: true });
    });

    app.post('/register', async(req, res) => {
        try {
            const { name, email, password, role } = req.body;
            
            const existingUser = await db.User.findOne({ where: { email } });
            if (existingUser) {
                return res.render('auth/register', { error: 'El correo ya está registrado', hideNav: true });
            }

            const salt = await bycrypt.genSalt(10);
            const hashedPassword = await bycrypt.hash(password, salt);

            await db.User.create({
                name,
                email,
                password: hashedPassword,
                role: role || 'client'
            });

            res.redirect('/login');
        } catch (error) {
            console.log(error);
            res.render('auth/register', { error: 'Error al registrar el usuario', hideNav: true });
        }
    });

    app.get('/login', (req, res) => {
        const error = req.session.flashError || null;
        req.session.flashError = null;
        res.render('auth/login', { error, hideNav: true });
    });

    app.post('/login', async(req, res) => {
        try {
            const { email, password } = req.body;
            
            const user = await db.User.findOne({ where: { email } });
            if (!user) {
                req.session.flashError = 'Credenciales incorrectas';
                return res.redirect('/login');
            }

            const isPasswordValid = await bycrypt.compare(password, user.password);
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
    });

    app.post('/logout', (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.log(err);
                return res.redirect('/');
            }
            res.redirect('/login');
        });
    });
};