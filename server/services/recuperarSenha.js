const db = require("../db");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

class RecuperarSenha {

    async verificarEmail(email) {
        return await db("User").where({ email }).first();
    }

    gerarCodigo() {
        return Math.floor(100000 + Math.random() * 900000).toString(); 
    }

    async salvarCodigo(email, codigo) {

        const expira = new Date();
        expira.setMinutes(expira.getMinutes() + 10);

        await db("User")
            .where({ email })
            .update({
                codigo_recuperacao: codigo,
                codigo_expira: expira
            });
    }

    async enviarCodigo(email, codigo) {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "SEU_EMAIL@gmail.com",
                pass: "SUA_SENHA_DE_APP"
            }
        });

        await transporter.sendMail({
            from: "Sistema <SEU_EMAIL@gmail.com>",
            to: email,
            subject: "Código de Recuperação de Senha",
            text: `Seu código de recuperação é: ${codigo}. Ele expira em 10 minutos.`
        });
    }

    async validarCodigo(email, codigoDigitado) {
        const usuario = await db("User")
            .where({ email })
            .first();

        if (!usuario) return false;
        if (!usuario.codigo_recuperacao) return false;

        const agora = new Date();
        const expira = new Date(usuario.codigo_expira);

        if (agora > expira) return false;
        if (usuario.codigo_recuperacao !== codigoDigitado) return false; 

        return true;
    }

    async atualizarSenha(email, novaSenha) {
        const hashed = await bcrypt.hash(novaSenha, 10);

        return await db("User")
            .where({ email })
            .update({
                password_hashed: hashed,
                codigo_recuperacao: null,
                codigo_expira: null
            });
    }
}

module.exports = new RecuperarSenha();
