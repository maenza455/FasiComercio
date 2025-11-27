package com.br.fasipe.compras.controller;

import com.br.fasipe.compras.dto.OrcamentoDTO;
import com.br.fasipe.compras.service.OrdemDeCompraService;
import com.br.fasipe.compras.service.AnaliseTemporalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ControlePedidosController {
    
    @Autowired
    private OrdemDeCompraService ordemDeCompraService;
    
    @Autowired
    private AnaliseTemporalService analiseTemporalService;
    
    @GetMapping("/orcamentos/pendentes")
    public ResponseEntity<List<Map<String, Object>>> buscarOrcamentosPendentes() {
        try {
            System.out.println("🔍 [CONTROLLER] Iniciando busca de orçamentos pendentes...");
            List<OrcamentoDTO> orcamentos = ordemDeCompraService.buscarOrcamentosPendentes();
            System.out.println("✅ [CONTROLLER] Encontrados " + orcamentos.size() + " orçamentos pendentes");
            
            // Agrupa por produto e inclui análise temporal
            System.out.println("🔍 [CONTROLLER] Agrupando orçamentos por produto...");
            Map<Integer, List<OrcamentoDTO>> orcamentosPorProduto = orcamentos.stream()
                .filter(o -> o.getIdProduto() != null)
                .collect(Collectors.groupingBy(OrcamentoDTO::getIdProduto));
            System.out.println("✅ [CONTROLLER] Agrupados em " + orcamentosPorProduto.size() + " produtos");
            
            // Calcula análise histórica por fornecedor (uma vez para todos)
            System.out.println("🔍 [CONTROLLER] Calculando análise histórica de fornecedores...");
            Map<Integer, AnaliseTemporalService.AnaliseTemporalDTO> analisesPorFornecedor = 
                analiseTemporalService.analisarHistoricoFornecedores(orcamentos);
            System.out.println("✅ [CONTROLLER] Análise concluída para " + analisesPorFornecedor.size() + " fornecedores");
            
            List<Map<String, Object>> resultado = new ArrayList<>();
            
            System.out.println("🔍 [CONTROLLER] Processando grupos de produtos...");
            for (Map.Entry<Integer, List<OrcamentoDTO>> entry : orcamentosPorProduto.entrySet()) {
                List<OrcamentoDTO> orcamentosDoProduto = entry.getValue();
                
                if (orcamentosDoProduto == null || orcamentosDoProduto.isEmpty()) {
                    System.out.println("⚠️ [CONTROLLER] Produto com lista de orçamentos vazia, pulando...");
                    continue;
                }
                
                // Calcula análise temporal do produto (mantido para compatibilidade)
                AnaliseTemporalService.AnaliseTemporalDTO analiseProduto = 
                    analiseTemporalService.analisarPrazosEntrega(orcamentosDoProduto);
                
                // Enriquecer cada orçamento com análise histórica do fornecedor
                List<Map<String, Object>> orcamentosEnriquecidos = new ArrayList<>();
                for (OrcamentoDTO orcamento : orcamentosDoProduto) {
                    if (orcamento == null || orcamento.getIdFornecedor() == null) {
                        System.out.println("⚠️ [CONTROLLER] Orçamento nulo ou sem fornecedor, pulando...");
                        continue;
                    }
                    
                    Map<String, Object> orcamentoMap = new HashMap<>();
                    orcamentoMap.put("dadosOrcamento", orcamento);
                    
                    // Adicionar análise histórica do fornecedor
                    AnaliseTemporalService.AnaliseTemporalDTO analiseFornecedor = 
                        analisesPorFornecedor.get(orcamento.getIdFornecedor());
                    
                    if (analiseFornecedor != null) {
                        orcamentoMap.put("historicoFornecedor", Map.of(
                            "prazoMedio", analiseFornecedor.getPrazoMedio(),
                            "desvioPadrao", analiseFornecedor.getDesvioPadrao(),
                            "coeficienteVariacao", analiseFornecedor.getCoeficienteVariacao(),
                            "isAlerta", analiseFornecedor.isAlerta(),
                            "totalEntregas", analiseFornecedor.getTotalEntregas(),
                            "interpretacao", analiseFornecedor.getInterpretacao()
                        ));
                    } else {
                        orcamentoMap.put("historicoFornecedor", Map.of(
                            "prazoMedio", 0.0,
                            "desvioPadrao", 0.0,
                            "coeficienteVariacao", 0.0,
                            "interpretacao", "Sem dados históricos de entrega",
                            "isAlerta", false,
                            "totalEntregas", 0
                        ));
                    }
                    
                    orcamentosEnriquecidos.add(orcamentoMap);
                }
                
                Map<String, Object> grupo = new HashMap<>();
                grupo.put("produto", orcamentosDoProduto.get(0));
                grupo.put("orcamentos", orcamentosEnriquecidos);
                grupo.put("analisetemporal", Map.of(
                    "prazoMedio", analiseProduto.getPrazoMedio(),
                    "desvioPadrao", analiseProduto.getDesvioPadrao(),
                    "coeficienteVariacao", analiseProduto.getCoeficienteVariacao(),
                    "isAlerta", analiseProduto.isAlerta()
                ));
                
                resultado.add(grupo);
            }
            
            System.out.println("✅ [CONTROLLER] Processamento concluído! Retornando " + resultado.size() + " grupos de produtos");
            return ResponseEntity.ok(resultado);
            
        } catch (Exception e) {
            System.err.println("❌ [CONTROLLER] ERRO ao carregar orçamentos: " + e.getClass().getName());
            System.err.println("❌ [CONTROLLER] Mensagem: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/ordens-de-compra/processar")
    public ResponseEntity<Map<String, String>> processarOrdensDeCompra(@RequestBody List<Long> orcamentoIds) {
        try {
            ordemDeCompraService.processarStatus(orcamentoIds);
            Map<String, String> response = Map.of("message", "Orçamentos processados com sucesso!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Endpoints de consulta removidos - apenas aprovação mantida
}

