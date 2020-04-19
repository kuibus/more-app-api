const express = require('express')
const { check } = require('express-validator')
const usersController = require('../controllers/users')
const fileUpload = require('../middleware/file-upload')

const router = express.Router() // this method allows to register routes

router.get('/', usersController.getUsers)
router.get('/:uid', usersController.getUserById)

router.post(
  '/signup',
  [ 
    check('email')
      .normalizeEmail()
      .isEmail(),
    check('password')
      .notEmpty()
      .isLength({min: 6})
  ],
  usersController.signup
)
router.post('/login', usersController.login)

router.patch('/:uid/picture',
  fileUpload.single('image'),
  usersController.updateProfilePicture
)

router.patch('/:uid/username',
  usersController.updateUsername
)

module.exports = router