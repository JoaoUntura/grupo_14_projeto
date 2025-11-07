const express = require('express')
const router = express.Router()
const clienteServices = require('../services/Cliente.js')


router.get('/', async(req,res) =>{
 

    res.render('editarusuario', {user: req.session.usuario})
})



module.exports = router