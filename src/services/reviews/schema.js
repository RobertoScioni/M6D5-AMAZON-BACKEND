const { Schema, model } = require("mongoose")
const mongoose = require("mongoose")
const mongoosePaginate = require("mongoose-paginate-v2")

const ReviewSchema = new Schema(
	{
		comment: {
			type: String,
			required: true,
		},
		rate: {
			type: Number,
			maximum: 5,
			minimum: 0,
			required: true,
		},
		product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
	},
	{ timestamps: true }
)
//{ type: "ObjectId", index: true }
const ReviewModel = model("Review", ReviewSchema)

ReviewSchema.plugin(mongoosePaginate)
ReviewSchema.static("findReviewWithProduct", async function (id) {
	const review = await ReviewModel.findById(id).populate(product)
	return review
})
module.exports = mongoose.model("Review", ReviewSchema)
