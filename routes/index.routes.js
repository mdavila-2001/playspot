const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/admin/dashboard.controller');
const courtController = require('../controllers/admin/court.controller');
const courtTypeController = require('../controllers/admin/court-type.controller');
const clientCatalogController = require('../controllers/client/catalog.controller');
const clientBookingController = require('../controllers/client/booking.controller');
const clientReviewController = require('../controllers/client/review.controller');
const scheduleController = require('../controllers/admin/schedule.controller');
const bookingController = require('../controllers/admin/booking.controller');
const reviewController = require('../controllers/admin/review.controller');
const { requireAuth, requireAdmin, requireClient } = require('../middlewares/auth.middleware');

router.get('/', (req, res) => {
    res.redirect('/dashboard');
});

router.get('/dashboard', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    
    if (req.session.role === 'admin') {
        return dashboardController.getDashboard(req, res);
    } else {
        return clientCatalogController.getCatalog(req, res);
    }
});

router.use('/admin', requireAuth, requireAdmin);
router.use('/client', requireAuth, requireClient);

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

router.get('/admin/schedules', scheduleController.getSchedules);

router.post('/admin/schedules/generate', scheduleController.generateSchedules);
router.post('/admin/schedules/delete/:id', scheduleController.deleteSchedule);
router.get('/admin/bookings', bookingController.listBookings);
router.post('/admin/bookings/confirm/:id', bookingController.confirmBooking);
router.post('/admin/bookings/complete/:id', bookingController.completeBooking);
router.post('/admin/bookings/cancel/:id', bookingController.cancelBooking);
router.post('/admin/bookings/update-status/:id', bookingController.updateStatus);

router.get('/admin/reviews', reviewController.listReviews);
router.post('/admin/reviews/delete/:id', reviewController.deleteReview);

router.get('/client/catalog', clientCatalogController.getCatalog);
router.post('/client/bookings', clientBookingController.createBooking);
router.get('/client/bookings', clientBookingController.getMyBookings);
router.post('/client/bookings/:id/cancel', clientBookingController.cancelBooking);
router.post('/client/bookings/review', clientReviewController.createReview);

module.exports = router;
