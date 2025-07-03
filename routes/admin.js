const { Router } = require("express");
const { z } = require("zod");
const { adminModel, courseModel } = require("../db");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')
const {JWT_ADMIN_PASSWORD} = require("../config");
const { adminMiddleware } = require("../middleware/admin");

const adminRouter = Router();
const zodadminschema = z.object({
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
adminRouter.post("/signup", async function (req, res) {
  try {
    const { email, password, firstName, lastName } = zodadminschema.parse(
      req.body
    );
    const existingadmin = await adminModel.findOne({ email });
    if (existingadmin) {
      return res.status(409).json({
        message: "Admin already exists",
      });
    }
    const adminhashedpassword = await bcrypt.hash(password, 5);

    await adminModel.create({
      email,
      password: adminhashedpassword,
      firstName,
      lastName,
    });
    return res.status(201).json({
      message: "Admin signup succeeded",
    });
  } catch (e) {
    res.status(403).send({
      error: e.errors || "something went wrong",
    });
  }
});

adminRouter.post("/signin", async function (req, res) {
  const { email, password } = req.body;
  const admin = await adminModel.findOne({
    email,
  });
  if (!admin) {
    return res.status(403).json({
      message: "Admin does not exists",
    });
  }

  const passwordMatch = await bcrypt.compare(password, admin.password);

  if (passwordMatch) {
    const token = jwt.sign(
      {
        id: admin._id,
      },
      JWT_ADMIN_PASSWORD
    );

    res.json({
      token,
    });
  } else {
    res.status(403).json({
      message: "Invalid creadentials",
    });
  }
});
adminRouter.post("/course", adminMiddleware ,async function (req, res) {
  const adminId = req.userId

  const {title,description,imageUrl,price} = req.body

  const course = await courseModel.create({
    title,
    description,
    imageUrl,
    price,
    createrId : adminId
  })
  res.json({
    message : "Course cerated",
    courseId : course._id
  })
});
adminRouter.put("/course", function (req, res) {});
adminRouter.get("/course/all", function (req, res) {});

module.exports = {
  adminRouter,
};
