const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin.controller');
const courtController = require('../controllers/admin/court.controller');
const courtTypeController = require('../controllers/admin/court-type.controller');
const clientController = require('../controllers/client.controller');

router.get('/', (req, res) => {
    res.redirect('/dashboard');
});

router.get('/dashboard', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    
    if (req.session.role === 'admin') {
        return adminController.getDashboard(req, res);
    } else {
        return clientController.getCatalog(req, res);
    }
});

router.get('/admin/courts', courtController.index);
router.get('/admin/courts/add', courtController.showCreate);
router.post('/admin/courts/add', courtController.upload.single('image_url'), courtController.createCourt);
router.get('/admin/courts/edit/:id', courtController.showEdit);
router.post('/admin/courts/edit/:id', courtController.upload.single('image_url'), courtController.updateCourt);
router.post('/admin/courts/delete/:id', courtController.deleteCourt);

router.get('/admin/court-types', courtTypeController.index);
router.get('/admin/court-types/add', courtTypeController.create);
router.post('/admin/court-types/add', courtTypeController.store);
router.get('/admin/court-types/edit/:id', courtTypeController.edit);
router.post('/admin/court-types/edit/:id', courtTypeController.update);
router.post('/admin/court-types/delete/:id', courtTypeController.destroy);

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
