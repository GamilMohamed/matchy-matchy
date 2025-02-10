var express = require('express');
const prisma = require('../db');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
	res.send('respond with MSSDASDSDSD');
});

async function alreadyInDatabase(email) {
	const user = await prisma.user.findUnique({
		where: {
			email
		}
	});
	return user;
}

router.post('/signup', async function (req, res, next) {
	try {
		console.log(req.body);
		const requiredFields = ['email', 'password', 'firstname', 'lastname'];
		requiredFields.forEach(field => {
			if (!(field in req.body)) {
				throw new Error(`Missing ${field} in request body`);
			}
		});
		const { email, password, firstname, lastname } = req.body;

		if (await alreadyInDatabase(email)) {
			throw new Error('Email already in use');
		}
		await prisma.user.create({
			data: {
				email,
				password,
				firstname,
				lastname
			}
		});
		return res.status(200).send('ok');
	}
	catch (e) {
		console.log(e);
		return res.status(500).send('Internal server error' + e);
	}
});

module.exports = router;
