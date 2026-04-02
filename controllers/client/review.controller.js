const db = require('../../models');

const reviewController = {};

reviewController.createReview = async (req, res) => {
    try {
        if (!req.session.userId) return res.redirect('/login');
        const { court_id, booking_id, rating, comment } = req.body;

        await db.Review.create({
            user_id: req.session.userId,
            court_id,
            rating: parseInt(rating),
            comment
        });

        if (booking_id) {
            await db.Booking.update({ is_reviewed: true }, { where: { id: booking_id } });
        }

        res.redirect('/client/bookings?success=review');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creando reseña');
    }
};

module.exports = reviewController;
