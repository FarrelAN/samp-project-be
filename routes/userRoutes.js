import express from 'express'
import {userController, getAllUsers} from '../controllers/userController.js'
import auth from '../middlewares/auth.js'

const router = express.Router()
//Public Routes
router.post('/register', userController.register)
router.post('/login', userController.login)

router.get('/', getAllUsers)

//Protected Routes
router.post('/changepassword',auth, userController.changePassword)
router.get('/user',auth, userController.getUserDetails)


export default router;
