# Mudanças no Cálculo do Desvio Padrão

**Data da Implementação:** 21/11/2025

## Resumo das Mudanças

Implementadas mudanças significativas na forma como calculamos e rastreamos o desvio padrão dos prazos de entrega dos fornecedores.

---

## 🔄 Mudanças Principais

### 1. **DATA_EMISSAO agora é preenchida na aprovação**

**Antes:**
- `DATA_EMISSAO` era preenchida manualmente ou ficava vazia
- Não havia rastreamento preciso do momento da aprovação

**Agora:**
- `DATA_EMISSAO` é automaticamente preenchida com `LocalDate.now()` quando um orçamento é aprovado
- Representa a data real em que o orçamento foi aprovado
- Exemplo: Orçamento aprovado em 15/11/2025 → `DATA_EMISSAO = 15/11/2025`

**Arquivo modificado:** `OrdemDeCompraService.java` - método `processarStatus()`

---

### 2. **Nova Base de Cálculo do Desvio Padrão**

**Critérios para incluir no cálculo:**
- ✅ `STATUS = 'aprovado'`
- ✅ `DATA_EMISSAO` preenchida (não nula)
- ✅ `DATA_ENTREGA` preenchida (não nula)

**Antes:**
- Baseado em `DATA_GERACAO` e `DATA_ENTREGA`
- Considerava status "Entregue"

**Agora:**
- Baseado em `DATA_EMISSAO` (aprovação) e `DATA_ENTREGA`
- Considera apenas status "aprovado"

**Arquivo modificado:** `OrcamentoRepository.java` - query `findHistoricoFornecedor()`

---

### 3. **Cálculo Correto do Desvio Padrão**

**Fórmula utilizada:**
```
Desvio Padrão = √(Σ(xi - média)² / N)
```

**Exemplo prático:**

Fornecedor X teve 4 entregas aprovadas:
1. Aprovado em 15/11/2025 → Entregue em 20/11/2025 = **5 dias**
2. Aprovado em 16/11/2025 → Entregue em 21/11/2025 = **5 dias**
3. Aprovado em 20/11/2025 → Entregue em 27/11/2025 = **7 dias**
4. Aprovado em 20/11/2025 → Entregue em 23/11/2025 = **3 dias**

**Cálculo:**
- Média = (5 + 5 + 7 + 3) / 4 = **5 dias**
- Flutuações em relação à média: 0, 0, 2, 2
- Variância = ((5-5)² + (5-5)² + (7-5)² + (3-5)²) / 4 = (0 + 0 + 4 + 4) / 4 = **2**
- Desvio Padrão = √2 = **~1.41 dias**

**Arquivo modificado:** `AnaliseTemporalService.java` - método `calcularAnaliseHistorica()`

---

## 📊 Interface Atualizada

**Mensagem exibida na tela de aprovação:**

```
📊 Histórico de Entregas
Prazo Médio: 5.0 dias
Desvio Padrão: 1.41 dias
(4 entregas aprovadas)
✅ Prazos consistentes
```

**Quando há alta variação:**
```
📊 Histórico de Entregas
Prazo Médio: 8.5 dias
Desvio Padrão: 4.23 dias
(6 entregas aprovadas)
⚠️ Alta variação nos prazos!
```

**Arquivo modificado:** `aprovacao.js`

---

## 🎯 Benefícios

1. **Rastreamento Preciso:** DATA_EMISSAO captura a data real da aprovação
2. **Cálculo Matemático Correto:** Usa a fórmula padrão do desvio padrão
3. **Dados Relevantes:** Considera apenas orçamentos aprovados com datas válidas
4. **Feedback Visual:** Interface mostra claramente o desvio padrão e sua interpretação

---

## ⚠️ Nota para DBAs

**Recomendação futura (não implementada ainda):**
- Avaliar se `DATA_EMISSAO` deve ser `NOT NULL` após ajuste manual dos dados históricos
- Por enquanto, mantemos como nullable para não quebrar dados existentes

---

## 📝 Arquivos Modificados

1. `OrdemDeCompraService.java` - Preenche DATA_EMISSAO na aprovação
2. `OrcamentoRepository.java` - Query atualizada para buscar orçamentos aprovados
3. `AnaliseTemporalService.java` - Novo cálculo do desvio padrão
4. `aprovacao.js` - Interface atualizada com mensagens melhoradas

---

## 🧪 Como Testar

1. Aprovar um orçamento
2. Verificar que `DATA_EMISSAO` foi preenchida com a data atual
3. Simular múltiplas aprovações com diferentes `DATA_ENTREGA`
4. Verificar o cálculo do desvio padrão na interface
5. Confirmar que a mensagem é exibida corretamente

---

**Implementado por:** GitHub Copilot  
**Data:** 21/11/2025  
**Solicitado por:** João Carlos Almeida
