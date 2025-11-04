const express = require('express')
const router = express.Router()

const userServices = require('../services/User')
const authServices = require('../services/Auth')
const abacate = require('../services/AbacatePay')

router.get('/', async(req,res) =>{
    const response = await userServices.findByEmail('admin')
        if (!response.values){
            await userServices.create('admin', authServices.hashPasswordService('admin'), 1, 'admin')
        }
    
    res.render('login')
})

router.post('/login',async(req, res)=>{

    const {usuario, senha} = req.body
    const response = await userServices.findByEmail(usuario)
    const user = response.values
    const validation = authServices.comparePasswordService(senha, user?.password_hashed)
    if (validation){
        req.session.usuario = user
        res.redirect('/home')
    }else{
          res.render('login',{erro: 'Usuário ou Senha inválidos'})
    }
   
})


module.exports = router