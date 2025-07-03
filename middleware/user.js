const jwt = require('jsonwebtoken')



function adminMiddleware(req,res){
    const token = req.headers.token
    const response = jwt.verify()
    
}