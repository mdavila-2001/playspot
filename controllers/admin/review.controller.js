const { Review, User, Court } = require('../../models');

const reviewController = {};

reviewController.listReviews = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            include: [
                { 
                    model: User, 
                    as: 'user', 
                    attributes: ['name'] 
                },
                { 
                    model: Court, 
                    as: 'court', 
                    attributes: ['name'] 
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        const currentUser = await User.findByPk(req.session.userId);

        res.render('admin/reviews/reviews', {
            user: currentUser,
            activePage: 'reviews',
            reviews: reviews
        });
    } catch (error) {
        console.error("Error al obtener reseñas:", error);
        res.redirect('/dashboard');
    }
};

reviewController.deleteReview = async (req, res) => {
    try {
        await Review.destroy({ where: { id: req.params.id } });
        res.redirect('/admin/reviews');
    } catch (error) {
        res.redirect('/admin/reviews');
    }
};

module.exports = reviewController;