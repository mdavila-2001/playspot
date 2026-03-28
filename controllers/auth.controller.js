const bycrypt = require('bcryptjs');

module.exports = (app,db) => {
    app.get('/register', (req, res) => {
        res.render('auth/register', { error:null });
    });

    app.post('/register', async(req, res) => {
        try {
            const { name, email, password, role } = req.body;
            
            const existingUser = await db.User.findOne({ where: { email } });
            if (existingUser) {
                return res.render('auth/register', { error: 'El correo ya está registrado' });
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
            res.render('auth/register', { error: 'Error al registrar el usuario' });
        }
    });

    app.get('/login', (req, res) => {
        res.render('auth/login', { error:null });
    });

    app.post('/login', async(req, res) => {
        try {
            const { email, password } = req.body;
            
            const user = await db.User.findOne({ where: { email } });
            if (!user) {
                return res.render('auth/login', { error: 'Usuario no encontrado' });
            }

            const isPasswordValid = await bycrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.render('auth/login', { error: 'Contraseña incorrecta' });
            }

            req.session.userId = user.id;
            req.session.role = user.role;

            res.redirect('/');
        } catch (error) {
            console.log(error);
            res.render('auth/login', { error: 'Error al iniciar sesión' });
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