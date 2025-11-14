const express = require('express')
const router = express.Router()



router.get('/', async(req,res) =>{
 
    res.render('editarusuario', {user: req.session.usuario})
})



module.exports = router