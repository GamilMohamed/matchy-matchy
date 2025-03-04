var express = require('express');
const jwt = require('jsonwebtoken');
var router = express.Router();
const prisma = require('../db');
const { body, validationResult } = require('express-validator');
const { getUserFromToken } = require('../utils/users.utils');


function formatValidationError(errors) {
  return "Invalid Values: " + errors.map(error => error.path).join(', ');
}


/* GET users listing. */
router.get('/', function(req, res) {
  res.send('respond with a resource');
});

router.get('/me', async function(req, res) {
  const user = await getUserFromToken(req.headers.authorization.split(' ')[1]);
  console.log("/me", user);
  res.status(200).json(user);
});

// use express validator

router.put('/profile', 
  body('gender').isString().trim().notEmpty(),
  body('sexualPreferences').isString().trim().notEmpty(),
  body('biography').isString().trim().notEmpty(),
  body('interests').isArray().notEmpty(),
  body('profilePicture').optional(),
  async function(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMsg = formatValidationError(errors.array());
      throw new Error (errorMsg);
    }
    const user = await getUserFromToken(req.headers.authorization.split(' ')[1]);
    if (!user) {
      throw new Error('Unauthorized');
    }
  
    const updatedUser = await prisma.user.update({
      where: {
        email: user.email
      },
      data: {
        ...req.body,
        profileComplete: true
      }
    });
    res.status(200).json(updatedUser);
  }
  catch (e) {
    console.log(e);
    return res.status(500).json({ message: e.message });
  }
  // res.send('respond with a resource' + token);
});


module.exports = router;
