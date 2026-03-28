module.exports = (app, db) => {
    require('./auth.controller')(app, db);
}