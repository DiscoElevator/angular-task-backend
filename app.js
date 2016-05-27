"use strict";

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const Datastore = require("nedb");
const Bluebird = require("bluebird");

let db = new Datastore();
promisify(db);

app.use(bodyParser.json());

app.get("/products", (req, res) => {
	db.findAsync({}).then(products => {
		res.status(200).json(products);
	}).catch(createDbOperationErrorHandler(res));
});

app.post("/products", (req, res) => {
	let product = req.body;
	if (product) {
		db.insertAsync(product).then(() => {
			res.status(200).end();
		}).catch(createDbOperationErrorHandler(res));
	}
});

app.get("/products/:id", (req, res) => {
	let id = req.params.id;
	db.findOneAsync({_id: id}).then(product => {
		res.status(200).json(product);
	}).catch(createDbOperationErrorHandler(res));
});

app.put("/products/:id", (req, res) => {
	let product = req.body;
	let id = req.params.id;
	if (product && id) {
		db.updateAsync({_id: id}, product).then(() => {
			res.status(200).end();
		}).catch(createDbOperationErrorHandler(res));
	}
});

app.delete("/products/:id", (req, res) => {
	let id = req.params.id;
	if (id) {
		db.removeAsync({_id: id}).then(() => {
			res.status(200).end();
		}).catch(createDbOperationErrorHandler(res));
	}
});

app.listen(8000, () => {
	console.log("server started");
});

function createDbOperationErrorHandler(res) {
	return function (err) {
		res.status(500).json({
			error: err
		});
	};
}

function promisify(db) {
	Bluebird.promisifyAll(db, {
		filter: function (name, func, target, passesDefaultFilter) {
			return passesDefaultFilter && (["insert", "find", "findOne", "loadDatabase", "remove"].indexOf(name) !== -1);
		}
	});
	db.updateAsync = Bluebird.promisify(db.update, {
		multiArgs: true
	});
}