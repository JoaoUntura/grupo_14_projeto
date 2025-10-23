const db = require("../db")


 class User{

    async findAll(){
        try {
            const users = await db.select("id","nome","email","role_id").table('User')
            return {validated: true, values:users}
        } catch (error) {
            return {validated: false, error: error}
        }
           }


    async findById(id){
        try{

            const user = await db.select("id","nome","email","role_id").where("id", id).table('User')
            return user.length > 0 
            ?{validated:true, values:user}
            :{validated:true, values:undefined}

        }catch(error){
            return {validated: false, error: error}
        }
    }

    async findByEmail(email){
        try{

            const user = await db.select("id","nome","email","password_hashed","role_id").where("email", email).table('User')
            return user.length > 0 
            ?{validated:true, values:user[0]}
            :{validated:true, values:undefined}

        }catch(error){
            return {validated: false, error: error}
        }
    }

    async create(email, password_hashed, role_id, nome){
        try{
            await db.insert({email:email,password_hashed:password_hashed, role_id:role_id, nome:nome}).table('User')
            return {validated:true}
        }catch(error){
            return {validated: false, error: error}
        }
    }

    async update(id, nome, email){

        let user = await this.findById(id)

        if(user.validated && user.values != undefined){
           
            let editUser = {}
            nome ? editUser.nome = nome : null
            email ? editUser.email = email : null

            try{
                await db.update(editUser).where('id', id).table("User")
                return {validated:true}
            }catch(error){
                return {validated: false, error: error}
            }

        }else{
            return {validated:false, error: "User não existente"}
        }

    }

    async delete(id){
        const validation = await this.findById(id)
    
        if (validation.values != undefined){
    
            try{
                await db.delete().where("id",id).table("User")
                return {validated:true}
    
            }catch(error){
                return {validated:false, error:error}
            }
    
        }else{
            return {validated:false, error: "User não existente"} 
        }
    
    }


}   

module.exports = new User()