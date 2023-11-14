import express from "express";
import {
  registerController,
  loginController,
  testController,
  forgotPasswordController,
  updatePofileController,
  getUsersController,
  insertKeywordController,
} from "../controllers/authController.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/signup", registerController);

//LOGIN ||post
router.post("/login", loginController);

//forgot password
router.post("/forgot-password", forgotPasswordController);

//test Routes
router.get("/test", requireSignIn, isAdmin, testController);

//protected User route auth
router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({ ok: true });
});
// protected Admin route auth
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});

// update Profile

router.put("/profile", requireSignIn, updatePofileController);

// get all users
router.get("/users", getUsersController);

// insert Search Keywords
router.put("/insertkeyword/:email", insertKeywordController);

export default router;
