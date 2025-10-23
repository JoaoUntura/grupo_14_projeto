
const db = require("../db")


 class Cliente{

    async findAll(){
        try {
            const cliente = await db.select("id","nome", "contato").table("Cliente")
            return {validated: true, values:cliente}
        } catch (error) {
            return {validated: false, error: error}
        }
           }


    async findById(id){
        try{

            const cliente = await db.select("id","nome", "contato").where("id", id).table("Cliente")
            return cliente.length > 0 
            ?{validated:true, values:cliente}
            :{validated:true, values:undefined}

        }catch(error){
            return {validated: false, error: error}
        }
    }

    async create(nome, contato){
        try{
            await db.insert({nome:nome, contato:contato}).table("Cliente")
            return {validated:true}
        }catch(error){
            return {validated: false, error: error}
        }
    }

    async update(id, nome, contato){

        let cliente = await this.findById(id)

        if(cliente.validated && cliente.values != undefined){
           
            let editCliente = {}
            nome ? editCliente.nome = nome : null
            contato ? editCliente.contato = contato : null

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