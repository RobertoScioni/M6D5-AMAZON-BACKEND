/**
 * external module
 */
const express = require("express")
const cors = require("cors")
const { join } = require("path")
const mongoose = require("mongoose")
/**
 * internal modules
 */
const {
	badRequest,
	notFound,
	forbidden,
	catchAllHandler,
} = require("./services/error")
const productRoutes = require("./services/products")
const reviewRoutes = require("./services/reviews")

/**
 * initializations
 */
const server = express()
const port = process.env.PORT || 2001
const publicFolder = process.env.PUBLIC || join(__dirname, "../public")

//server initialization process
server.use(cors())
server.use(express.json())
server.use(express.static(publicFolder)) //overkill, i know
server.use("/products", productRoutes)
server.use("/reviews", reviewRoutes)
server.use(badRequest)
server.use(notFound)
server.use(forbidden)
server.use(catchAllHandler)

/**
 * start
 */
mongoose
	.connect(process.env.MONGO_CONNECTION, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
	})
	.then(
		server.listen(port, () => {
			console.log("Running on port", port)
		})
	)
	.catch((err) => console.log(err))
