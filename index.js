const express = require('express')
const app = express()

app.post("/user/signup",function(req,res){
    res.json({
        message : "signup endpoint"
    })
})
app.post("/user/signin",function(req,res){
    res.json({
        message : "signin endpoint"
    })
})
app.get("/courses/purchases",function(req,res){
    res.json({
        message : "signup endpoint"
    })
})
app.post("/user/purchase")
app.get("/courses",function(req,res){
    res.json({
        message : "signup endpoint"
    })
})







app.listen(3000)