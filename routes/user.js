const {Router} = require("express")

const userRouter = Router()

userRouter.post("/signup", function (req, res) {
  res.json({
    message: "signup endpoint",
  });
});

userRouter.post("/signin", function (req, res) {
  res.json({
    message: "signin endpoint",
  });
});

userRouter.post("/purchase", function (req, res) {
  res.json({
    message: "signup endpoint",
  });
});


module.exports = ({
    userRouter : userRouter
})