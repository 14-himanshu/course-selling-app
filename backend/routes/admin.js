const { Router } = require("express");
const { z } = require("zod");
const { adminModel, courseModel, lessonModel } = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_ADMIN_PASSWORD } = require("../config");
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

const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const createCourseSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(5),
  imageUrl: z.string().url(),
  price: z.number().positive(),
});

const updateCourseSchema = z.object({
  courseId: z.string().length(24), // basic check for ObjectId length
  title: z.string().min(3).max(100).optional(),
  description: z.string().min(5).optional(),
  imageUrl: z.string().url().optional(),
  price: z.number().positive().optional(),
});

const createLessonSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().optional(),
  videoUrl: z.string().url(),
  order: z.number().optional()
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

adminRouter.post("/signin", async function (req, res, next) {
  try {
    const { email, password } = signinSchema.parse(req.body);
    const admin = await adminModel.findOne({ email });
    if (!admin) {
      return res.status(403).json({ message: "Admin does not exists" });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);

    if (passwordMatch) {
      const token = jwt.sign({ id: admin._id }, JWT_ADMIN_PASSWORD);
      res.json({ token });
    } else {
      res.status(403).json({ message: "Invalid creadentials" });
    }
  } catch (e) {
    next(e);
  }
});
adminRouter.post("/course", adminMiddleware, async function (req, res, next) {
  try {
    const adminId = req.userId;
    const { title, description, imageUrl, price } = createCourseSchema.parse(req.body);

    const course = await courseModel.create({
      title,
      description,
      imageUrl,
      price,
      createrId: adminId,
    });
    res.json({
      message: "Course cerated",
      courseId: course._id,
    });
  } catch (e) {
    next(e);
  }
});
adminRouter.put("/course", adminMiddleware, async function (req, res, next) {
  try {
    const adminId = req.userId;
    const { title, description, imageUrl, price, courseId } = updateCourseSchema.parse(req.body);

    const course = await courseModel.updateOne(
      { _id: courseId, createrId: adminId },
      { title, description, imageUrl, price }
    );
    res.json({
      message: "Course updated",
      courseId: course._id, // note: updateOne does not return the updated doc, we might need findOneAndUpdate in the future if we want _id back
    });
  } catch (e) {
    next(e);
  }
});
adminRouter.get("/course/all", adminMiddleware, async function (req, res, next) {
  try {
    const adminId = req.userId;
    
    // Pagination logic
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const courses = await courseModel.find({
      createrId: adminId,
    })
    .skip(skip)
    .limit(limit);

    const totalCourses = await courseModel.countDocuments({ createrId: adminId });

    res.json({
      message: "Courses retrieved",
      courses,
      pagination: {
        total: totalCourses,
        page,
        limit,
        totalPages: Math.ceil(totalCourses / limit)
      }
    });
  } catch (e) {
    next(e);
  }
});

adminRouter.post("/course/:courseId/lesson", adminMiddleware, async function (req, res, next) {
  try {
    const adminId = req.userId;
    const courseId = req.params.courseId;
    
    // Check if the course belongs to the admin
    const course = await courseModel.findOne({ _id: courseId, createrId: adminId });
    if (!course) {
      return res.status(404).json({ message: "Course not found or you do not have permission" });
    }

    const { title, description, videoUrl, order } = createLessonSchema.parse(req.body);

    const lesson = await lessonModel.create({
      courseId,
      title,
      description,
      videoUrl,
      order: order || 0
    });

    res.status(201).json({
      message: "Lesson created successfully",
      lessonId: lesson._id
    });
  } catch (e) {
    next(e);
  }
});

module.exports = {
  adminRouter,
};
