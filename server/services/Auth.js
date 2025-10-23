const bcrypt = require("bcrypt")
class Auth{
  hashPasswordService(password){
    let salt = bcrypt.genSaltSync(10)
    let passHash = bcrypt.hashSync(password, salt)
    
    return passHash

  }

   comparePasswordService(password, user_password){
    let isPassword = bcrypt.compareSync(password, user_password)
    return isPassword
  }

 }

 module.exports = new Auth()