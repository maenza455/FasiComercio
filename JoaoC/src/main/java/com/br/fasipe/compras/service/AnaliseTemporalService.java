package com.br.fasipe.compras.service;

import com.br.fasipe.compras.dto.OrcamentoDTO;
import com.br.fasipe.compras.repository.OrcamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnaliseTemporalService {
    
    @Autowired
    private OrcamentoRepository orcamentoRepository;
    
    /**
     * Analisa o histórico de desempenho de cada fornecedor em relação aos prazos de entrega
     * NOVA LÓGICA (15/11/2025):
     * - Usa DATA_EMISSAO (preenchida no momento da aprovação) ao invés de DATA_GERACAO
     * - Calcula desvio padrão baseado na flutuação dos prazos de entrega
     * - Considera apenas orçamentos com STATUS='aprovado', DATA_EMISSAO e DATA_ENTREGA preenchidos
     */
    public Map<Integer, AnaliseTemporalDTO> analisarHistoricoFornecedores(List<OrcamentoDTO> orcamentosAtuais) {
        Map<Integer, AnaliseTemporalDTO> analisesPorFornecedor = new HashMap<>();
        
        if (orcamentosAtuais == null || orcamentosAtuais.isEmpty()) {
            System.out.println("⚠️ [ANALISE] Lista de orçamentos vazia ou nula");
            return analisesPorFornecedor;
        }
        
        System.out.println("🔍 [ANALISE] Iniciando análise de " + orcamentosAtuais.size() + " orçamentos");
        
        // Para cada fornecedor nos orçamentos atuais, buscar histórico completo
        for (OrcamentoDTO orcamento : orcamentosAtuais) {
            Integer idFornecedor = orcamento.getIdFornecedor();
            
            if (idFornecedor == null) {
                System.out.println("⚠️ [ANALISE] Orçamento sem ID de fornecedor, pulando...");
                continue;
            }
            
            if (!analisesPorFornecedor.containsKey(idFornecedor)) {
                System.out.println("🔍 [ANALISE] Buscando histórico do fornecedor ID: " + idFornecedor);
                try {
                    // Buscar todos os orçamentos históricos deste fornecedor que já foram entregues
                    List<com.br.fasipe.compras.model.Orcamento> historicoEntidades = orcamentoRepository.findHistoricoFornecedor(idFornecedor);
                    List<OrcamentoDTO> historicoFornecedor = converterParaDTO(historicoEntidades);
                    System.out.println("✅ [ANALISE] Encontrados " + historicoFornecedor.size() + " registros históricos");
                    
                    // Calcular análise temporal baseada no histórico
                    AnaliseTemporalDTO analise = calcularAnaliseHistorica(historicoFornecedor);
                    analisesPorFornecedor.put(idFornecedor, analise);
                } catch (Exception e) {
                    System.err.println("❌ [ANALISE] Erro ao buscar histórico do fornecedor " + idFornecedor + ": " + e.getMessage());
                    // Criar análise vazia em caso de erro
                    analisesPorFornecedor.put(idFornecedor, new AnaliseTemporalDTO(0.0, 0.0, 0.0, false, 0, "Erro ao buscar histórico"));
                }
            }
        }
        
        System.out.println("✅ [ANALISE] Análise concluída para " + analisesPorFornecedor.size() + " fornecedores");
        return analisesPorFornecedor;
    }
    
    /**
     * Calcula a análise temporal baseada no histórico real de entregas do fornecedor
     * NOVA LÓGICA: Baseado em DATA_EMISSAO (aprovação) → DATA_ENTREGA
     * Calcula o desvio padrão das flutuações em relação ao prazo médio
     */
    private AnaliseTemporalDTO calcularAnaliseHistorica(List<OrcamentoDTO> historicoFornecedor) {
        if (historicoFornecedor == null || historicoFornecedor.isEmpty()) {
            return new AnaliseTemporalDTO(0.0, 0.0, 0.0, false, 0, "Sem dados históricos de entrega");
        }
        
        System.out.println("\n📊 ============ ANÁLISE TEMPORAL ============");
        System.out.println("📊 Total de orçamentos no histórico: " + historicoFornecedor.size());
        
        // DEBUG: Mostrar dados de cada orçamento
        for (OrcamentoDTO o : historicoFornecedor) {
            System.out.println("  📦 ID: " + o.getIdOrcamento() + 
                             " | Fornecedor: " + o.getIdFornecedor() + 
                             " | DATA_EMISSAO: " + o.getDataEmissao() + 
                             " | DATA_ENTREGA: " + o.getDataEntrega());
        }
        
        // Calcular dias entre DATA_EMISSAO (aprovação) e DATA_ENTREGA para cada orçamento
        List<Long> diasEntrega = historicoFornecedor.stream()
            .filter(o -> o.getDataEmissao() != null && o.getDataEntrega() != null)
            .map(o -> ChronoUnit.DAYS.between(o.getDataEmissao(), o.getDataEntrega()))
            .collect(Collectors.toList());
        
        System.out.println("📊 Orçamentos válidos (com ambas as datas): " + diasEntrega.size());
        System.out.println("📊 Dias de entrega calculados: " + diasEntrega);
        
        if (diasEntrega.isEmpty()) {
            return new AnaliseTemporalDTO(0.0, 0.0, 0.0, false, 0, "Dados insuficientes para cálculo de desvio");
        }
        
        // Calcular média dos dias de entrega
        double media = diasEntrega.stream()
            .mapToDouble(Long::doubleValue)
            .average()
            .orElse(0.0);
        
        // Calcular desvio padrão usando a fórmula correta
        // Desvio Padrão = sqrt(Σ(xi - média)² / N)
        // Exemplo: Se temos entregas de 5, 5, 7, 3 dias
        //   média = (5+5+7+3)/4 = 5 dias
        //   flutuações: 0, 0, 2, 2
        //   variância = ((5-5)² + (5-5)² + (7-5)² + (3-5)²) / 4 = (0+0+4+4)/4 = 2
        //   desvio padrão = sqrt(2) ≈ 1.41
        double variancia = diasEntrega.stream()
            .mapToDouble(dias -> Math.pow(dias - media, 2))
            .average()
            .orElse(0.0);
        
        double desvioPadrao = Math.sqrt(variancia);
        double coeficienteVariacao = media != 0 ? (desvioPadrao / Math.abs(media)) * 100 : 0;
        
        System.out.println("\n📊 ============ RESULTADO DO CÁLCULO ============");
        System.out.println("📊 Média calculada: " + String.format("%.2f", media) + " dias");
        System.out.println("📊 Variância: " + String.format("%.4f", variancia));
        System.out.println("📊 Desvio Padrão calculado: " + String.format("%.2f", desvioPadrao) + " dias");
        System.out.println("📊 Coeficiente de Variação: " + String.format("%.2f", coeficienteVariacao) + "%");
        System.out.println("📊 Total de entregas: " + diasEntrega.size());
        System.out.println("📊 ============================================\n");
        
        // Alerta se desvio > 3 dias (mais rigoroso para fornecedores) OU coeficiente > 30%
        boolean isAlerta = desvioPadrao > 3.0 || coeficienteVariacao > 30.0;
        
        // Interpretar resultado para o usuário
        String interpretacao = interpretarDesempenhoFornecedor(media, desvioPadrao, diasEntrega.size());
        
        return new AnaliseTemporalDTO(media, desvioPadrao, coeficienteVariacao, isAlerta, diasEntrega.size(), interpretacao);
    }
    
    /**
     * Cria uma interpretação amigável do desempenho do fornecedor
     */
    private String interpretarDesempenhoFornecedor(double mediaDias, double desvioPadrao, int totalEntregas) {
        if (totalEntregas == 0) {
            return "Sem dados históricos de entrega";
        }
        
        if (totalEntregas < 3) {
            return "Poucos dados para análise confiável de desvio";
        }
        
        if (desvioPadrao <= 1.0) {
            return "Muito consistente (baixo desvio padrão)";
        } else if (desvioPadrao <= 3.0) {
            return "Razoavelmente consistente";
        } else if (desvioPadrao <= 5.0) {
            return "Variação moderada nos prazos";
        } else {
            return "Alta variação - risco de atraso";
        }
    }
    
    /**
     * Converte entidades Orcamento para OrcamentoDTO
     */
    private List<OrcamentoDTO> converterParaDTO(List<com.br.fasipe.compras.model.Orcamento> entidades) {
        return entidades.stream()
            .map(this::converterParaDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Converte uma entidade Orcamento para OrcamentoDTO
     */
    private OrcamentoDTO converterParaDTO(com.br.fasipe.compras.model.Orcamento orcamento) {
        OrcamentoDTO dto = new OrcamentoDTO();
        dto.setIdOrcamento(orcamento.getIdOrcamento());
        dto.setIdFornecedor(orcamento.getFornecedor() != null ? orcamento.getFornecedor().getId() : null);
        dto.setIdProduto(orcamento.getProduto() != null ? orcamento.getProduto().getId() : null);
        dto.setDataEmissao(orcamento.getDataEmissao());
        dto.setDataEntrega(orcamento.getDataEntrega());
        dto.setNomeFornecedor(orcamento.getFornecedor() != null ? orcamento.getFornecedor().getDescricao() : null);
        dto.setStatus(orcamento.getStatus());
        return dto;
    }
    
    public AnaliseTemporalDTO analisarPrazosEntrega(List<OrcamentoDTO> orcamentos) {
        if (orcamentos == null || orcamentos.isEmpty()) {
            return new AnaliseTemporalDTO(0.0, 0.0, 0.0, false);
        }
        
        LocalDate hoje = LocalDate.now();
        
        // Converte datas de entrega para dias a partir de hoje
        List<Long> diasEntrega = orcamentos.stream()
            .filter(o -> o.getDataEntrega() != null)
            .map(o -> ChronoUnit.DAYS.between(hoje, o.getDataEntrega()))
            .collect(Collectors.toList());
        
        if (diasEntrega.isEmpty()) {
            return new AnaliseTemporalDTO(0.0, 0.0, 0.0, false);
        }
        
        // Calcula média
        double media = diasEntrega.stream()
            .mapToDouble(Long::doubleValue)
            .average()
            .orElse(0.0);
        
        // Calcula desvio padrão
        double variancia = diasEntrega.stream()
            .mapToDouble(dias -> Math.pow(dias - media, 2))
            .average()
            .orElse(0.0);
        
        double desvioPadrao = Math.sqrt(variancia);
        
        // Calcula coeficiente de variação (%)
        double coeficienteVariacao = media != 0 ? (desvioPadrao / Math.abs(media)) * 100 : 0;
        
        // Define se é alerta (desvio > 5 dias OU coeficiente > 50%)
        boolean isAlerta = desvioPadrao > 5.0 || coeficienteVariacao > 50.0;
        
        return new AnaliseTemporalDTO(media, desvioPadrao, coeficienteVariacao, isAlerta);
    }
    
    public static class AnaliseTemporalDTO {
        private final double prazoMedio;
        private final double desvioPadrao;
        private final double coeficienteVariacao;
        private final boolean isAlerta;
        private final int totalEntregas;
        private final String interpretacao;
        
        public AnaliseTemporalDTO(double prazoMedio, double desvioPadrao, double coeficienteVariacao, boolean isAlerta) {
            this(prazoMedio, desvioPadrao, coeficienteVariacao, isAlerta, 0, "");
        }
        
        public AnaliseTemporalDTO(double prazoMedio, double desvioPadrao, double coeficienteVariacao, boolean isAlerta, int totalEntregas, String interpretacao) {
            this.prazoMedio = prazoMedio;
            this.desvioPadrao = desvioPadrao;
            this.coeficienteVariacao = coeficienteVariacao;
            this.isAlerta = isAlerta;
            this.totalEntregas = totalEntregas;
            this.interpretacao = interpretacao;
        }
        
        public double getPrazoMedio() { return prazoMedio; }
        public double getDesvioPadrao() { return desvioPadrao; }
        public double getCoeficienteVariacao() { return coeficienteVariacao; }
        public boolean isAlerta() { return isAlerta; }
        public int getTotalEntregas() { return totalEntregas; }
        public String getInterpretacao() { return interpretacao; }
    }
}