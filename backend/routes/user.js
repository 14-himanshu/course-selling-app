const { Router } = require("express");
const { z } = require("zod");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { userModel, purchaseModel ,courseModel} = require("../db");
const { JWT_USER_PASSWORD } = require("../config");
const { userMiddleware } = require("../middleware/user");
const userRouter = Router();

const zoduserSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(6)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])/,
      "Password must include lowercase, uppercase, and a special character"
    ),
  firstName: z.string().min(3).max(20),
  lastName: z.string().min(3).max(20),
});

const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

userRouter.post("/signup", async function (req, res) {
  try {
    const { email, password, firstName, lastName } = zoduserSchema.parse(
      req.body
    );
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.send({
        message: "User already exists!!",
      });
    }
    const hashedpassword = await bcrypt.hash(password, 5);
    await userModel.create({
      email,
      password: hashedpassword,
      firstName,
      lastName,
    });
    res.json({
      message: "You are signed up",
    });
  } catch (e) {
    res.status(403).json({
      error: e.errors,
    });
  }
});

userRouter.post("/signin", async function (req, res, next) {
  try {
    const { email, password } = signinSchema.parse(req.body);
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(403).json({ message: "Users does not exists" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      const token = jwt.sign({ id: user._id }, JWT_USER_PASSWORD);
      res.json({ token });
    } else {
      res.status(403).json({ message: "Invalid creadentials" });
    }
  } catch (e) {
    next(e);
  }
});

userRouter.post("/purchase/:courseId", userMiddleware, async function (req, res, next) {
  try {
    const userId = req.userId;
    const courseId = req.params.courseId;

    // Check if course exists
    const course = await courseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if already purchased
    const existingPurchase = await purchaseModel.findOne({ userId, courseId });
    if (existingPurchase) {
      return res.status(409).json({ message: "You have already purchased this course" });
    }

    await purchaseModel.create({
      userId,
      courseId,
    });

    res.json({
      message: "Course purchased successfully",
    });
  } catch (e) {
    next(e);
  }
});

userRouter.get("/purchase", userMiddleware, async function (req, res, next) {
  try {
    const userId = req.userId;
    const purchases = await purchaseModel.find({ userId });

    const purchasedCourseIds = purchases.map((p) => p.courseId);

    const coursesData = await courseModel.find({
      _id: { $in: purchasedCourseIds },
    });

    res.json({
      purchases,
      coursesData,
    });
  } catch (e) {
    next(e);
  }
});

module.exports = {
  userRouter: userRouter,
};
