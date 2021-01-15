const { Schema, model } = require("mongoose")
const mongoose = require("mongoose")
const mongoosePaginate = require("mongoose-paginate-v2")

const ProductSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		brand: {
			type: String,
			required: true,
		},
		imageUrl: {
			type: String,
			required: true,
		},
		imageUrl: {
			type: String,
		},
		price: {
			type: Number,
			required: true,
			lowercase: true,
		},
		category: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
)
//{ type: "ObjectId", index: true }
const ProductModel = model("Product", ProductSchema)

ProductSchema.plugin(mongoosePaginate)
ProductSchema.static("findProductWithAuthor", async (id) => {
	const product = await ProductModel.findById(id).populate(author)
	return product
})
module.exports = mongoose.model("Product", ProductSchema)
