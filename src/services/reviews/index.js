/**
 *   the reviews look like this:
 *    {
 *       "_id": "123455", //SERVER GENERATED
 *       "comment": "A good book but definitely I don't like many parts of the plot", //REQUIRED
 *       "rate": 3, //REQUIRED, max 5
 *       "elementId": "5d318e1a8541744830bef139", //REQUIRED
 *       "createdAt": "2019-08-01T12:46:45.895Z" // SERVER GENERATED
 *   },
 *
 *  CRUD for Reviews ( /reviews GET, POST, DELETE, PUT)
 */

/**
 * basic imports
 */
const { response } = require("express")
const express = require("express")
const { join } = require("path")
const fs = require("fs-extra") //friendship ended with fs, fs extra is my new best friend
const mongoose = require("mongoose")
const q2m = require("query-to-mongo")
const ReviewSchema = require("./schema")
const multer = require("multer")
const { writeFile } = require("fs-extra")
const { check, validationResult } = require("express-validator")
//initialization
const router = express.Router()
const upload = multer({})
const table = "reviews.json"
const valid = [
	check("comment")
		.isLength({ min: 3 })
		.withMessage("minimum lenght is 3 characters")
		.exists()
		.withMessage("name must exist"),
	check("rate")
		.isInt({ max: 5, min: 0 })
		.withMessage("rate must be a number and should be less then 5")
		.exists()
		.withMessage("rate must exist"),
]
//routes
router.get("/", async (req, res, next) => {
	try {
		const query = q2m(req.query)

		const reviews = await ReviewSchema.find(query.criteria)
			.sort(query.options.sort)
			.skip(query.options.offset)
			.limit(query.options.limit)
			.populate("product")
		res.send(reviews)
	} catch (error) {
		return next(error)
	}
})

router.get("/:id", async (req, res, next) => {
	try {
		const reviews = await ReviewSchema.findById(req.params.id).populate(
			"product"
		)
		res.send(reviews)
	} catch (error) {
		return next(error)
	}
})

router.get("/product/:id", async (req, res, next) => {
	const product = new mongoose.Types.ObjectId(req.params.id) //`ObjectId(${req.params.id})`

	try {
		const query = q2m(req.query)
		const reviews = await ReviewSchema.find({
			product: product,
		})
			.sort(query.options.sort)
			.skip(query.options.offset)
			.limit(query.options.size)
			.populate("product")
		res.send(reviews)
	} catch (error) {
		return next(error)
	}
})

router.post("/:productID", valid, async (req, res, next) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		const err = {}
		err.message = errors
		console.log(err.message)
		err.httpStatusCode = 400
		next(err)
		return
	}
	const review = { ...req.body }
	review.product = req.params.productID
	try {
		const newReview = new ReviewSchema(review)
		const { _id } = await newReview.save()

		res.status(201).send(_id)
	} catch (error) {
		next(error)
	}
})

router.delete("/:id", async (req, res, next) => {
	try {
		const review = await ReviewSchema.findByIdAndDelete(req.params.id)
		if (review) {
			res.send("Deleted")
		} else {
			const error = new Error(`Review with id ${req.params.id} not found`)
			error.httpStatusCode = 404
			next(error)
		}
	} catch (error) {
		next(error)
	}
})

router.put("/:id", valid, async (req, res, next) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		const err = {}
		err.message = errors
		console.log(err.message)
		err.httpStatusCode = 400
		next(err)
		return
	}
	try {
		const review = await ReviewSchema.findByIdAndUpdate(
			req.params.id,
			req.body,
			{
				runValidators: true,
				new: true,
			}
		)
		if (review) {
			res.send(review)
		} else {
			const error = new Error(`Review with id ${req.params.id} not found`)
			error.httpStatusCode = 404
			next(error)
		}
	} catch (error) {
		next(error)
	}
})

router.post("/:id/image", upload.single("imageUrl"), async (req, res, next) => {
	const dest = join(
		__dirname,
		"../../../public/img/reviews",
		req.file.originalname
	)

	console.log("save image in ", dest)
	console.log("buffer mime", req.file.mimetype)
	console.log(req.file.buffer)
	const update = {
		imageUrl: `http://localhost:${process.env.PORT || 2001}/img/reviews/${
			req.file.originalname
		}`,
	}
	try {
		await writeFile(dest, req.file.buffer)
		const review = await ReviewSchema.findByIdAndUpdate(req.params.id, update, {
			runValidators: true,
			new: true,
		})
		if (review) {
			res.send(review)
		} else {
			const error = new Error(`Product with id ${req.params.id} not found`)
			error.httpStatusCode = 404
			next(error)
		}
	} catch (error) {
		next(error)
	}
})

module.exports = router
