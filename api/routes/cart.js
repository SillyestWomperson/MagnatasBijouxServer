const express=require("express")
const {authenticateToken}=require("../middleware/authMiddleware")
const {attachDB}=require("../config/db")

const roteador = express.Router()

// GET
roteador.get("/", authenticateToken, attachDB, async (req,res)=>{
    try {
       const emailUser = req.auth.email 
       if (!emailUser){
        return res.status(400).json({message:"Não foi possível identificar o usuário."})
       }
       const colecaoUsuarios = req.db.collection("users")
       const documentoUsuario = await colecaoUsuarios.findOne({email:emailUser}, {projection:{password:0,_id:0}})

       if (!documentoUsuario){
        return res.status(404).json({ message: "Usuário não encontrado." });
       }
       const itensCarrinho = documentoUsuario.cart
       if (!itensCarrinho){
        return res.status(404).json({ message: "Nenhum item no carrinho." });
       }
       res.status(200).json({message:"Itens do carrinho encontrados com sucesso.", cart:itensCarrinho})

    } catch (error) { 
        return res.status(500).json({ message: "Ocorreu um erro interno. Tente novamente mais tarde." });
    }
})

// DELETE
roteador.delete("/", authenticateToken, attachDB, async (req,res)=>{
    try {
        const emailUser = req.auth.email 
       if (!emailUser){
        return res.status(400).json({message:"Não foi possível identificar o usuário."})
       }
       const colecaoUsuarios = req.db.collection("users")
       const resultado = await colecaoUsuarios.updateOne({email:emailUser}, {$set:{cart:[]}})
       if (resultado.matchedCount === 0) {
        return res.status(404).json({ message: "Usuário não encontrado." });
       }
       if (resultado.modifiedCount === 0) {
        return res.status(200).json({message:"Carrinho já está vazio."})
       }
        res.status(200).json({message:"Carrinho foi limpado com sucesso.", cart:[]})
    } catch (error) {
        return res.status(500).json({ message: "Ocorreu um erro interno. Tente novamente mais tarde." });
    }
})

module.exports = roteador