import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        rating: {
            type: Number,
            required: [true, 'Please provide a rating'],
            min: 1,
            max: 5,
        },
        title: {
            type: String,
            trim: true,
        },
        comment: {
            type: String,
            trim: true,
        },
        helpful: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Update product ratings when review is saved
reviewSchema.post('save', async function () {
    const Review = this.constructor;
    const reviews = await Review.find({ product: this.product });

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await mongoose.model('Product').findByIdAndUpdate(this.product, {
        'ratings.average': averageRating,
        'ratings.count': reviews.length,
    });
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
