
const db = require("../db")


 class Cliente{

    async findAll(){
        try {
            const cliente = await db.select("id","nome", "contato", "email", "cpf").table("Cliente")
            return {validated: true, values:cliente}
        } catch (error) {
            return {validated: false, error: error}
        }
           }


    async findById(id){
        try{

            const cliente = await db.select("id","nome", "contato","email", "cpf").where("id", id).table("Cliente")
            return cliente.length > 0 
            ?{validated:true, values:cliente[0]}
            :{validated:true, values:undefined}

        }catch(error){
            return {validated: false, error: error}
        }
    }

    async create(nome, contato, email, cpf){
        try{
            await db.insert({nome:nome, contato:contato, email:email, cpf:cpf}).table("Cliente")
            return {validated:true}
        }catch(error){
            return {validated: false, error: error}
        }
    }

    async update(id, nome, contato, email, cpf){

        let cliente = await this.findById(id)

        if(cliente.validated && cliente.values != undefined){
           
            let editCliente = {}
            nome ? editCliente.nome = nome : null
            contato ? editCliente.contato = contato : null
            email ? editCliente.email = email : null
            cpf ? editCliente.cpf = cpf : null

            try{
                await db.update(editCliente).where('id', id).table("Cliente")
                return {validated:true}
            }catch(error){
                return {validated: false, error: error}
            }

        }else{
            return {validated:false, error: "Cliente não existente"}
        }

    }

    async delete(id){
        const validation = await this.findById(id)

        if (validation.values != undefined){

            try{
                await db.delete().where("id",id).table("Cliente")
                return {validated:true}

            }catch(error){
                return {validated:false, error:error}
            }

        }else{
            return {validated:false, error: "Cliente não existente"} 
        }

    }

    


}


module.exports = new Cliente()