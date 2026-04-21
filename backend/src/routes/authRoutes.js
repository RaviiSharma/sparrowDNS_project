import express from 'express';
import { getUser, loginUser, logoutUser, registerUser } from '../controllers/authController.js';
import { isAuth } from '../middleware/authMiddleware.js';



const router = express.Router();

router.post("/login",loginUser)
router.post("/register",registerUser)
router.get("/user",isAuth,getUser)
router.post("/logout",logoutUser)

router.use((req, res) => {
    res
        .status(400)
        .send({ status: false, message: "invalid http request in authRoutes" });
});


export default router;
