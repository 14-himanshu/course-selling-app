const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = mongoose.ObjectId;

const userSchema = new Schema({
  userId: ObjectId,
  email: { type: String, unique: true },
  password: String,
  firstName: String,
  lastName: String,
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
  createrID: ObjectId,
});
const purchasesSchema = new Schema({
  userId: ObjectId,
  courseId: ObjectId,
});

const userModel = mongoose.model("user", userSchema);
const adminModel = mongoose.model("admin", adminSchema);
const courseModel = mongoose.model("course", courseSchema);
const purchaseModel = mongoose.model("purchases", purchasesSchema);

module.exports = {
  userModel,
  adminModel,
  courseModel,
  purchaseModel,
};
