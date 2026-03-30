const authRoutes  = require('./auth.routes');
const indexRoutes = require('./index.routes');

module.exports = (app) => {
    app.use('/', authRoutes);
    app.use('/', indexRoutes);
};
