const express = require('express')
const router = express.Router()
const userServices = require("../services/User")
const authServices = require("../services/Auth")


router.get('/',(req,res) =>{
    res.render('funcionarios',{user: req.session.usuario})
})


router.post('/', async(req,res) =>{
    const request = req.body
   const newUser =  await userServices.create(request.email, authServices.hashPasswordService(request.senha), 2, request.nomeCompleto)
   console.log(newUser)
   
})



module.exports = router