package com.br.fasipe.compras.controller;

import com.br.fasipe.compras.dto.OrcamentoDTO;
import com.br.fasipe.compras.service.OrdemDeCompraService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ControlePedidosController {
    
    @Autowired
    private OrdemDeCompraService ordemDeCompraService;
    
    @GetMapping("/orcamentos/pendentes")
    public ResponseEntity<List<OrcamentoDTO>> buscarOrcamentosPendentes() {
        try {
            List<OrcamentoDTO> orcamentos = ordemDeCompraService.buscarOrcamentosPendentes();
            return ResponseEntity.ok(orcamentos);
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

