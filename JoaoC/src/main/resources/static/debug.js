// Teste de Debug
console.log("=== TESTE DE DEBUG ===");

// Primeira vamos testar a API diretamente
fetch('http://localhost:8080/api/orcamentos/pendentes')
  .then(response => response.json())
  .then(data => {
    console.log("Total de orçamentos retornados:", data.length);
    
    // Vamos agrupar por produto para ver quantos orçamentos há por produto
    const porProduto = {};
    data.forEach(orcamento => {
      const produtoId = orcamento.idProduto;
      if (!porProduto[produtoId]) {
        porProduto[produtoId] = {
          nome: orcamento.nomeProduto,
          orcamentos: []
        }
      }
      porProduto[produtoId].orcamentos.push({
        idOrcamento: orcamento.idOrcamento,  
        fornecedor: orcamento.nomeFornecedor,
        preco: orcamento.precoCompra
      });
    });
    
    console.log("=== AGRUPAMENTO POR PRODUTO ===");
    Object.entries(porProduto).forEach(([produtoId, info]) => {
      console.log(`Produto ${produtoId} - ${info.nome}:`);
      console.log(`  Quantidade de orçamentos: ${info.orcamentos.length}`);
      info.orcamentos.forEach((orc, index) => {
        console.log(`  ${index + 1}. Fornecedor: ${orc.fornecedor}, Preço: ${orc.preco}, ID: ${orc.idOrcamento}`);
      });
      console.log("---");
    });
  })
  .catch(error => {
    console.error("Erro:", error);
  });