const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = mongoose.ObjectId;

const userSchema = new Schema({
  userId: ObjectId,
  email: { type: String, unique: true },
  password: String,
  firstName: String,
  lastName: String,
  phone: String,
});
const adminSchema = new Schema({
  email: { type: String, unique: true },
  password: String,
  firstName: String,
  lastName: String,
});
const courseSchema = new Schema({
  title: String,
  description: String,
  imageUrl: String,
  price: Number,
  createrId: ObjectId,
});
const purchaseSchema = new Schema({
    courseId: ObjectId,
    userId: ObjectId
});

const lessonSchema = new Schema({
    courseId: { type: ObjectId, ref: 'courses', required: true },
    title: { type: String, required: true },
    description: String,
    videoUrl: { type: String, required: true },
    order: { type: Number, default: 0 }
});

const userModel = mongoose.model("users", userSchema);
const adminModel = mongoose.model("admins", adminSchema);
const courseModel = mongoose.model("courses", courseSchema);
const purchaseModel = mongoose.model("purchases", purchaseSchema);
const lessonModel = mongoose.model("lessons", lessonSchema);

module.exports = {
  userModel,
  adminModel,
  courseModel,
  purchaseModel,
  lessonModel,
};
