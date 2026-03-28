const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    if (req.session.userId) {
        res.render('index', { user: req.session.user });
    } else {
        res.redirect('/login');
    }
});

module.exports = router;
