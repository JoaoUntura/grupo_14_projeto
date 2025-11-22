const db = require("../db")


 class Produto{

    async findAll(){
        try {
            const produtos = await db.select("id","nome","preco").table('Produto')
            return {validated: true, values:produtos}
        } catch (error) {
            return {validated: false, error: error}
        }
           }


    async findById(id){
        try{

            const produto = await db.select("id","nome","preco").where("id", id).table('Produto')
            return produto.length > 0 
            ?{validated:true, values:produto[0]}
            :{validated:true, values:undefined}

        }catch(error){
            return {validated: false, error: error}
        }
    }

    async create(nome, preco){
        try{
            await db.insert({nome:nome, preco:preco}).table("Produto")
            return {validated:true}
        }catch(error){
            return {validated: false, error: error}
        }
    }

    async update(id, nome, preco){

        let produto = await this.findById(id)

        if(produto.validated && produto.values != undefined){
           
            let editProduto = {}
            nome ? editProduto.nome = nome : null
            preco ? editProduto.preco = preco : null

            try{
                await db.update(editProduto).where('id', id).table("Produto")
                return {validated:true}
            }catch(error){
                return {validated: false, error: error}
            }

        }else{
            return {validated:false, error: "Produto não existente"}
        }

    }

    async delete(id){
        const validation = await this.findById(id)
    
        if (validation.values != undefined){
    
            try{
                await db.delete().where("id",id).table("Produto")
                return {validated:true}
    
            }catch(error){
                return {validated:false, error:error}
            }
    
        }else{
            return {validated:false, error: "Produto não existente"} 
        }
    
    }

   

}   

module.exports = new Produto()