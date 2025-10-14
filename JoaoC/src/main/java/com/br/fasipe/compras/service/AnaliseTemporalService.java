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
     */
    public Map<Integer, AnaliseTemporalDTO> analisarHistoricoFornecedores(List<OrcamentoDTO> orcamentosAtuais) {
        Map<Integer, AnaliseTemporalDTO> analisesPorFornecedor = new HashMap<>();
        
        if (orcamentosAtuais == null || orcamentosAtuais.isEmpty()) {
            return analisesPorFornecedor;
        }
        
        // Para cada fornecedor nos orçamentos atuais, buscar histórico completo
        for (OrcamentoDTO orcamento : orcamentosAtuais) {
            Integer idFornecedor = orcamento.getIdFornecedor();
            
            if (idFornecedor != null && !analisesPorFornecedor.containsKey(idFornecedor)) {
                // Buscar todos os orçamentos históricos deste fornecedor que já foram entregues
                List<com.br.fasipe.compras.model.Orcamento> historicoEntidades = orcamentoRepository.findHistoricoFornecedor(idFornecedor);
                List<OrcamentoDTO> historicoFornecedor = converterParaDTO(historicoEntidades);
                
                // Calcular análise temporal baseada no histórico
                AnaliseTemporalDTO analise = calcularAnaliseHistorica(historicoFornecedor);
                analisesPorFornecedor.put(idFornecedor, analise);
            }
        }
        
        return analisesPorFornecedor;
    }
    
    /**
     * Calcula a análise temporal baseada no histórico real de entregas do fornecedor
     */
    private AnaliseTemporalDTO calcularAnaliseHistorica(List<OrcamentoDTO> historicoFornecedor) {
        if (historicoFornecedor == null || historicoFornecedor.isEmpty()) {
            return new AnaliseTemporalDTO(0.0, 0.0, 0.0, false, 0, "Sem dados históricos de entrega");
        }
        
        // Calcular diferenças entre data prometida (dataEntrega) e data real de entrega
        List<Long> diferencasDias = historicoFornecedor.stream()
            .filter(o -> o.getDataEntrega() != null && o.getDataEmissao() != null)
            .map(o -> ChronoUnit.DAYS.between(o.getDataEmissao(), o.getDataEntrega()))
            .collect(Collectors.toList());
        
        if (diferencasDias.isEmpty()) {
            return new AnaliseTemporalDTO(0.0, 0.0, 0.0, false, 0, "Dados insuficientes para cálculo de desvio");
        }
        
        // Calcular estatísticas
        double media = diferencasDias.stream()
            .mapToDouble(Long::doubleValue)
            .average()
            .orElse(0.0);
        
        double variancia = diferencasDias.stream()
            .mapToDouble(dias -> Math.pow(dias - media, 2))
            .average()
            .orElse(0.0);
        
        double desvioPadrao = Math.sqrt(variancia);
        double coeficienteVariacao = media != 0 ? (desvioPadrao / Math.abs(media)) * 100 : 0;
        
        // Alerta se desvio > 3 dias (mais rigoroso para fornecedores) OU coeficiente > 30%
        boolean isAlerta = desvioPadrao > 3.0 || coeficienteVariacao > 30.0;
        
        // Interpretar resultado para o usuário
        String interpretacao = interpretarDesempenhoFornecedor(media, desvioPadrao, diferencasDias.size());
        
        return new AnaliseTemporalDTO(media, desvioPadrao, coeficienteVariacao, isAlerta, diferencasDias.size(), interpretacao);
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