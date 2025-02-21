var express = require('express');
const prisma = require('../db');
var router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const saltRounds = 10;
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

router.post('/signinx', async function (req, res, next) {
	return res.status(200).json({token: 'token', user: {email: 'email', id: 'id'}});
}
);


router.post('/signup', async function (req, res, next) {
	try {
		console.log(req.body);
		const requiredFields = ['email', 'password', 'firstname', 'lastname', 'username'];
		requiredFields.forEach(field => {
			if (!(field in req.body)) {
				throw new Error(`Missing ${field} in request body`);
			}
		});
		const { email, password, firstname, lastname, username } = req.body;

		if (await alreadyInDatabase(email)) {
			throw new Error('Email already in use');
		}

		// hash password
		const hashedPassword = await bcrypt.hash(password, saltRounds);
		console.log(hashedPassword);
		// verify password
		const isPasswordCorrect = await bcrypt.compare(password, hashedPassword);
		await prisma.user.create({
			data: {
				email,
				password: hashedPassword,
				firstname,
				lastname,
				username
			}
		});
		return res.status(200).send('ok');
	}
	catch (e) {
		console.log(e);
		return res.status(500).send('Internal server error' + e);
	}
});

router.post('/signin', async function (req, res, next) {
	console.log("hello world");

	try {
		console.log(req.body);
		const requiredFields = ['email', 'password'];
		requiredFields.forEach(field => {
			if (!(field in req.body)) {
				throw new Error(`Missing ${field} in request body`);
			}
		});
		const { email, password } = req.body;

		const user = await prisma.user.findUnique({
			where: {
				email
			}
		});
		if (!user) {
			throw new Error('User not found');
		}
		const isPasswordCorrect = await bcrypt.compare(password, user.password);
		if (!isPasswordCorrect) {
			throw new Error('Incorrect password');
		}

		// generate token
		const payload = {
			email: user.email,
			id: user.id,
			date: new Date(),
		}

		const jwtExpire = 3 * 23 * 60 * 60 * 1000
		const token = jwt.sign(payload, process.env.JWT_SECRET, {
			expiresIn: jwtExpire
		});
		console.log(token);
		return res.status(200).json({token, user});
	}
	catch (e) {
		console.log(e);
		return res.status(500).send('Internal server error' + e);
	}
});

module.exports = router;
