const db = require("../db");

class Pagamentos {
  async findAll() {
    try {
      const pagamentos = await db("Pagamento").select();

      return { validated: true, values: pagamentos };
    } catch (error) {
      console.error(error);
      return { validated: false, error };
    }
  }

  async findById(id) {
    try {
      const pagamento = await db
        .select(
          "id",
          "externalId",
          "data_criacao",
          "data_pagamento",
          "metodo",
          "status",
          "totalCentavos"
        )
        .where("id", id)
        .table("Pagamento");

      return pagamento.length > 0
        ? { validated: true, values: pagamento[0] }
        : { validated: true, values: undefined };
    } catch (error) {
      return { validated: false, error };
    }
  }

  async createAndReturnId( externalId, metodo, status, totalCentavos) {
    try {
      const [id] = await db
        .insert({
        data_criacao: new Date().toISOString().slice(0, 10), 
          externalId,
          metodo,
          status,
          totalCentavos,
        })
        .table("Pagamento");
    
      return { validated: true, values: id };
    } catch (error) {
      return { validated: false, error };
    }
  }

  async update(externalId, codigoPix,qrCode,idQrCodePayment, status, metodo, data_criacao, data_pagamento,   totalCentavos, ) {

      const editPagamento = {};
      codigoPix ? (editPagamento.codigoPix = codigoPix) : null;
      qrCode ?(editPagamento.qrCode = qrCode) : null;
      idQrCodePayment ? (editPagamento.idQrCodePayment = idQrCodePayment) : null;
      data_criacao ? (editPagamento.data_criacao = data_criacao) : null;
      data_pagamento ? (editPagamento.data_pagamento = data_pagamento) : null;
      metodo ? (editPagamento.metodo = metodo) : null;
      status ? (editPagamento.status = status) : null;
      totalCentavos ? (editPagamento.totalCentavos = totalCentavos) : null;

      try {
        await db.update(editPagamento).where("externalId", externalId).table("Pagamento");
        return { validated: true };
      } catch (error) {
        return { validated: false, error };
      }
   
  }

  async delete(id) {
    const validation = await this.findById(id);

    if (validation.values !== undefined) {
      try {
        await db.delete().where("id", id).table("Pagamento");
        return { validated: true };
      } catch (error) {
        return { validated: false, error };
      }
    } else {
      return { validated: false, error: "Pagamento não existente" };
    }
  }
}

module.exports = new Pagamentos();
