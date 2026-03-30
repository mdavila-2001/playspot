const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin.controller');
const clientController = require('../controllers/client.controller');

router.get('/', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    if (req.session.role === 'admin') {
        return res.redirect('/admin/dashboard');
    } else {
        return res.redirect('/client/catalog');
    }
});

router.get('/admin/dashboard', adminController.getDashboard);
router.post('/admin/schedules', adminController.generateSchedules);
router.get('/admin/bookings', adminController.getAllBookings);
router.post('/admin/bookings/:id/status', adminController.changeBookingStatus);

router.get('/client/catalog', clientController.getCatalog);
router.post('/client/bookings', clientController.createBooking);
router.get('/client/bookings', clientController.getMyBookings);
router.post('/client/bookings/:id/cancel', clientController.cancelBooking);
router.post('/client/bookings/review', clientController.createReview);

module.exports = router;
