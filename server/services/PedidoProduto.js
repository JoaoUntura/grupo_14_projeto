import db from "../config/database.js";

 class PedidoProduto{

    async findAll(){
        try {
            const pedidoProduto = await db.select("pedido_produto.id", "pedido_produto.pedido_id",
            "pedido_produto.produto_id", "pedido_produto.quantidade", "Produto.nome")
            .innerJoin('Produto', 'pedido_produto.produto_id', '=', 'Produto.id')
            .table("pedido_produto")
            return {validated: true, values:pedidoProduto}
        } catch (error) {
            return {validated: false, error: error}
        }
    }


    async findById(id){
        try{

            const pedidoProduto = await db.select("id", "pedido_id", "produto_id", "quantidade").where("id", id).table("pedido_produto")
            return pedidoProduto.length > 0 
            ?{validated:true, values:pedidoProduto}
            :{validated:true, values:undefined}

        }catch(error){
            return {validated: false, error: error}
        }
    }

    

    async update(id, pedido_id, produto_id,quantidade){

        let pedidoProduto = await this.findById(id)

        if(pedidoProduto.validated && pedidoProduto.values != undefined){
           
            let editPedProduto = {}
            pedido_id ? editPedProduto.pedido_id = pedido_id : null
            produto_id ? editPedProduto.produto_id = produto_id : null
            quantidade ? editPedProduto.quantidade = quantidade : null

            try{
                await db.update(editPedProduto).where('id', id).table("pedido_produto")
                return {validated:true}
            }catch(error){
                return {validated: false, error: error}
            }

        }else{
            return {validated:false, error: "pedido_produto não existente"}
        }

    }

    async delete(id){
        const validation = await this.findById(id)
    
        if (validation.values != undefined){
    
            try{
                await db.delete().where("id",id).table("pedido_produto")
                return {validated:true}
    
            }catch(error){
                return {validated:false, error:error}
            }
    
        }else{
            return {validated:false, error: "pedido_produto não existente"} 
        }
    
    }

    async create(pedido_id, produto_id,quantidade){
        try{
            await db.insert({pedido_id:pedido_id, produto_id:produto_id, quantidade:quantidade}).table("pedido_produto")
            return {validated:true}
        }catch(error){
            return {validated: false, error: error}
        }
    }

}

export default new PedidoProduto()