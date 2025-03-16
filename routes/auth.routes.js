import { Router } from "express";
import { signIn, signOut, signUp } from "../controllers/auth.controller.js";
import { signInValidator, signUpValidator } from "../validators/auth.validator.js";
import validateRequest from "../middlewares/validation.middleware.js";

const authRouter = Router();

/**
 * @route POST /api/v1/auth/sign-up
 * @desc Register a new user
 * @access Public
 */
authRouter.post('/sign-up', signUpValidator, validateRequest, signUp);

/**
 * @route POST /api/v1/auth/sign-in
 * @desc Authenticate user & get token
 * @access Public
 */
authRouter.post('/sign-in', signInValidator, validateRequest, signIn);

/**
 * @route POST /api/v1/auth/sign-out
 * @desc Sign out user (client-side token removal)
 * @access Public
 */
authRouter.post('/sign-out', signOut);

export default authRouter;