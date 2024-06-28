import express from "express";
import { google, signOut, signin, signup } from "../controller/auth.controller.js"; // Ensure the path is correct

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/google", google);
router.get("/signout", signOut);

export default router;
