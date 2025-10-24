const db = require("../db")

class Pedido {
 async findAll() {
  try {
    const pedidosRaw = await db("Pedido")
      .select(
        "Pedido.id",
        "Pedido.data",
        "Pedido.cliente_id",
        "Pedido.total",
        "Pedido.forma_pagamento",
        "Pedido.entrega",
        "Cliente.nome as cliente_nome",
        "Produto.nome as produto_nome"
      )
      .innerJoin("Cliente", "Pedido.cliente_id", "Cliente.id")
      .innerJoin("pedido_produto", "Pedido.id", "pedido_produto.pedido_id")
      .innerJoin("Produto", "pedido_produto.produto_id", "Produto.id");

    // Agrupa os produtos por pedido
    const pedidosMap = {};

    for (const p of pedidosRaw) {
      if (!pedidosMap[p.id]) {
        pedidosMap[p.id] = {
          id: p.id,
          data: p.data,
          cliente_id: p.cliente_id,
          total: p.total,
          forma_pagamento: p.forma_pagamento,
          entrega: p.entrega,
          cliente_nome: p.cliente_nome,
          produtos: []
        };
      }
      pedidosMap[p.id].produtos.push(p.produto_nome);
    }

    const pedidos = Object.values(pedidosMap);

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

  async create(data, cliente_id, total, forma_pagamento, entrega) {
    try {
      const pedido = await db
        .insert({
          data: data,
          cliente_id: cliente_id,
          total: total,
          forma_pagamento: forma_pagamento,
          entrega:entrega
        })
        .returning('id')
        .table("Pedido");
      return { validated: true, values:pedido };
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

  async insertViaCsv(file) {
    const formatDate = (dateStr) => {
      const [day, month, year] = dateStr.split("/");
      return `${year}-${month}-${day}`;
    };
    const results = [];
    try {
      fs.createReadStream(file)
        .pipe(csv())
        .on("data", (data) => {
          const newData = {
            data: formatDate(data.data),
            cliente_id: parseInt(data.cliente_id),
            total: parseFloat(data.total),
            forma_pagamento: data?.forma_pagamento || "Não Informado",
          };
          results.push(newData);
        })
        .on("end", async () => {
          await db("Pedido").insert(results);
          fs.unlinkSync(file);
        });

      return { validated: true, values: results };
    } catch (err) {
      return { validated: false, err: err.message };
    }
  }
}


module.exports = new Pedido();
