const db = require("../db")

class Pedido {
 async findAll() {
  try {
    const pedidosRaw = await db("Pedido")
      .select(
        "Pedido.id",
        "Pedido.data",
        "Pedido.externalId as pedido_external_id",
        "Pedido.entrega",
        "Cliente.nome as cliente_nome",
        "Cliente.contato as cliente_contato",
        "Cliente.email as cliente_email",
        "Cliente.cpf as cliente_cpf",
        "Produto.nome as produto_nome",
        "Pagamento.externalId as pagamento_external_id",
        "Pagamento.status as status ",
        "Pagamento.totalCentavos as total",
        "Pagamento.metodo as metodo",
        "Pagamento.codigoPix as codigoPix",
        "Pagamento.qrCode as qrCode",
        "Pagamento.idQrCodePayment as idPix",
      )
      .innerJoin("Cliente", "Pedido.cliente_id", "Cliente.id")
      .innerJoin("Pagamento", "Pedido.pagamento_id", "Pagamento.id")
      .innerJoin("pedido_produto", "Pedido.id", "pedido_produto.pedido_id")
      .innerJoin("Produto", "pedido_produto.produto_id", "Produto.id");

    // Agrupa os produtos por pedido
    const pedidosMap = {};

    for (const p of pedidosRaw) {
      if (!pedidosMap[p.id]) {
        pedidosMap[p.id] = {
          id: p.id,
          pedido_external_id: p.pedido_external_id,
          pagamento_external_id: p.pagamento_external_id,
          data: p.data,
          total: p.total,
          metodo: p.metodo,
          entrega: p.entrega,
          cliente_nome: p.cliente_nome,
          cliente_contato: p.cliente_contato,
          cliente_email: p.cliente_email,
          cliente_cpf: p.cliente_cpf,
          status: p.status,
          codigoPix:p.codigoPix,
          qrCode:p.qrCode,
          idPix:p.idPix,
          produtos: []
        };
      }
      pedidosMap[p.id].produtos.push(p.produto_nome);
    }

    const pedidos = Object.values(pedidosMap);
    console.log(pedidos)

    return { validated: true, values: pedidos };
  } catch (error) {
    console.error(error);
    return { validated: false, error };
  }
}



  async findById(id) {
    try {
      const pedido = await db
        .select("id", "data", "cliente_id", "total", "forma_pagamento")
        .where("id", id)
        .table("Pedido");
      return pedido.length > 0
        ? { validated: true, values: pedido }
        : { validated: true, values: undefined };
    } catch (error) {
      return { validated: false, error: error };
    }
  }

  async create(data, externalId, cliente_id, pagamento_id, entrega) {
    try {
      const [id]  = await db
        .insert({
          data: data,
          externalId:externalId,
          cliente_id: cliente_id,
          pagamento_id:pagamento_id,
          entrega:entrega
        })
   
        .table("Pedido");
      return { validated: true, values:id };
    } catch (error) {
      return { validated: false, error: error };
    }
  }

  async update(id, data, cliente_id, total, forma_pagamento, entrega) {
    let pedido = await this.findById(id);

    if (pedido.validated && pedido.values != undefined) {
      let editPedido = {};
      data ? (editPedido.data = data) : null;
      cliente_id ? (editPedido.cliente_id = cliente_id) : null;
      total ? (editPedido.total = total) : null;
      forma_pagamento ? (editPedido.forma_pagamento = forma_pagamento) : null;
      entrega ? (editPedido.entrega = entrega) : null;

      try {
        await db.update(editPedido).where("id", id).table("Pedido");
        return { validated: true };
      } catch (error) {
        return { validated: false, error: error };
      }
    } else {
      return { validated: false, error: "Pedido não existente" };
    }
  }

  async delete(id){
    const validation = await this.findById(id)

    if (validation.values != undefined){

        try{
            await db.delete().where("id",id).table("Pedido")
            return {validated:true}

        }catch(error){
            return {validated:false, error:error}
        }

    }else{
        return {validated:false, error: "Pedido não existente"} 
    }

}

  
}


module.exports = new Pedido();
