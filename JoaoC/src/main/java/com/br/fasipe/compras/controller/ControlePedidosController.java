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
            List<OrcamentoDTO> orcamentos = ordemDeCompraService.buscarOrcamentosPendentes();
            
            // Agrupa por produto e inclui análise temporal
            Map<Integer, List<OrcamentoDTO>> orcamentosPorProduto = orcamentos.stream()
                .collect(Collectors.groupingBy(OrcamentoDTO::getIdProduto));
            
            // Calcula análise histórica por fornecedor (uma vez para todos)
            Map<Integer, AnaliseTemporalService.AnaliseTemporalDTO> analisesPorFornecedor = 
                analiseTemporalService.analisarHistoricoFornecedores(orcamentos);
            
            List<Map<String, Object>> resultado = new ArrayList<>();
            
            for (Map.Entry<Integer, List<OrcamentoDTO>> entry : orcamentosPorProduto.entrySet()) {
                List<OrcamentoDTO> orcamentosDoProduto = entry.getValue();
                
                // Calcula análise temporal do produto (mantido para compatibilidade)
                AnaliseTemporalService.AnaliseTemporalDTO analiseProduto = 
                    analiseTemporalService.analisarPrazosEntrega(orcamentosDoProduto);
                
                // Enriquecer cada orçamento com análise histórica do fornecedor
                List<Map<String, Object>> orcamentosEnriquecidos = new ArrayList<>();
                for (OrcamentoDTO orcamento : orcamentosDoProduto) {
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
            
            return ResponseEntity.ok(resultado);
            
        } catch (Exception e) {
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

