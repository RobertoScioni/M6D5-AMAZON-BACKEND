const badRequest = (err, req, res, next) => {
	if (err.httpStatusCode === 400) {
		console.log(err)
		res.status(400).send("bad request!")
	}
	next(err)
}
const notFound = (err, req, res, next) => {
	if (err.httpStatusCode === 404) {
		console.log(err)
		res.status(404).send("not found!")
	}
	next(err)
}

const forbidden = (err, req, res, next) => {
	if (err.httpStatusCode === 403) {
		console.log(err)
		res
			.status(403)
			.send(
				"We know what you are doing, this accident will be reported.We know what you are doing, this accident will be reported. This accident is Treason.Treason is punishable by death."
			)
	}
	next(err)
}

const catchAllHandler = (err, req, res, next) => {
	if (!res.headersSent) {
		console.log(err)
		res.status(err.httpStatusCode || 500).send("Generic Server Error")
	}
}

module.exports = { badRequest, catchAllHandler, notFound, forbidden }
