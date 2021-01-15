/**
 *  Every product in your marketplace is shaped in this way:
 *    {
 *       "_id": "5d318e1a8541744830bef139", //SERVER GENERATED
 *       "name": "app test 1",  //REQUIRED
 *       "description": "somthing longer", //REQUIRED
 *       "brand": "nokia", //REQUIRED
 *       "imageUrl": "https://drop.ndtv.com/TECH/product_database/images/2152017124957PM_635_nokia_3310.jpeg?downsize=*:420&output-quality=80",
 *       "price": 100, //REQUIRED
 *       "category": "smartphones"
 *       "createdAt": "2019-07-19T09:32:10.535Z", //SERVER GENERATED
 *       "updatedAt": "2019-07-19T09:32:10.535Z", //SERVER GENERATED
 *   }
 *
 *  CRUD for Products ( /products GET, POST, DELETE, PUT)
 */

/**
 * basic imports
 */
const { response } = require("express")
const express = require("express")
const mongoose = require("mongoose")
const q2m = require("query-to-mongo")
const ProductSchema = require("./schema")
const { join } = require("path")
const fs = require("fs-extra") //friendship ended with fs, fs extra is my new best friend
const multer = require("multer")
const { writeFile } = require("fs-extra")
const { check, validationResult } = require("express-validator")
//initialization
const router = express.Router()
const upload = multer({})
const valid = [
	check("name")
		.isLength({ min: 3 })
		.withMessage("minimum lenght is 3 characters")
		.exists()
		.withMessage("name must exist"),
	check("description")
		.isLength({ min: 5 })
		.withMessage("description too short")
		.exists()
		.withMessage("description must be provided"),
	check("brand")
		.isLength({ min: 3 })
		.withMessage("minimum lenght is 3 characters")
		.exists()
		.withMessage("brand must exist"),
	check("price")
		.isNumeric()
		.withMessage("price is usually a numeber")
		.exists()
		.withMessage("price must exist"),
]
//routes
router.get("/", async (req, res, next) => {
	try {
		const query = q2m(req.query)
		console.log(query)
		const products = await ProductSchema.find(query.criteria)
			.sort(query.options.sort)
			.skip(query.options.offset)
			.limit(query.options.limit)
		res.send(products)
	} catch (error) {
		return next(error)
	}
})

router.post("/", valid, async (req, res, next) => {
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
		const newProduct = new ProductSchema(req.body)
		const { _id } = await newProduct.save()

		res.status(201).send(_id)
	} catch (error) {
		next(error)
	}
})

router.delete("/:id", async (req, res, next) => {
	try {
		const product = await ProductSchema.findByIdAndDelete(req.params.id)
		if (product) {
			res.send("Deleted")
		} else {
			const error = new Error(`Product with id ${req.params.id} not found`)
			error.httpStatusCode = 404
			next(error)
		}
	} catch (error) {
		next(error)
	}
})

router.put("/:id", valid, async (req, res, next) => {
	try {
		const product = await ProductSchema.findByIdAndUpdate(
			req.params.id,
			req.body,
			{
				runValidators: true,
				new: true,
			}
		)
		if (product) {
			res.send(product)
		} else {
			const error = new Error(`Product with id ${req.params.id} not found`)
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
		"../../../public/img/products",
		req.file.originalname
	)

	console.log("save image in ", dest)
	console.log("buffer mime", req.file.mimetype)
	console.log(req.file.buffer)
	const update = {
		imageUrl: `http://localhost:${process.env.PORT || 2001}/img/products/${
			req.file.originalname
		}`,
	}
	try {
		await writeFile(dest, req.file.buffer)
		const product = await ProductSchema.findByIdAndUpdate(
			req.params.id,
			update,
			{
				runValidators: true,
				new: true,
			}
		)
		if (product) {
			res.send(product)
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
