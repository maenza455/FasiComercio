// Estado da aplicação
let orcamentosPorProduto = {};
let selecoes = {};
let loading = false;

// Elementos do DOM
const loadingDiv = document.getElementById('loadingDiv');
const errorDiv = document.getElementById('errorDiv');
const successDiv = document.getElementById('successDiv');
const orcamentosContainer = document.getElementById('orcamentosContainer');
const actionsDiv = document.getElementById('actionsDiv');
const gerarOcBtn = document.getElementById('gerarOcBtn');
const statsDiv = document.getElementById('statsDiv');

// Carregamento inicial
document.addEventListener('DOMContentLoaded', function() {
    carregarOrcamentos();
});

// Configuração do botão de gerar ordens
gerarOcBtn.addEventListener('click', function() {
    if (!gerarOcBtn.disabled) {
        gerarOrdensDeCompra();
    }
});

/**
 * Carrega os orçamentos pendentes de aprovação
 */
async function carregarOrcamentos() {
    try {
        mostrarLoading(true);
        hideMessages();
        
        const response = await fetch('/api/orcamentos/pendentes', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
        }

        const orcamentos = await response.json();
        
        if (!Array.isArray(orcamentos)) {
            throw new Error('Formato de resposta inválido');
        }

        console.log('Orçamentos recebidos:', orcamentos);
        processarOrcamentos(orcamentos);
        
    } catch (error) {
        console.error('Erro ao carregar orçamentos:', error);
        showError('Erro ao carregar orçamentos: ' + error.message);
    } finally {
        mostrarLoading(false);
    }
}

/**
 * Processa os dados que já vêm agrupados por produto com análise temporal
 */
function processarOrcamentos(dadosAgrupados) {
    if (!dadosAgrupados || dadosAgrupados.length === 0) {
        mostrarSemDados();
        return;
    }

    // Resetar estruturas globais
    orcamentosPorProduto = {};
    
    // Processar cada grupo de produto
    dadosAgrupados.forEach(grupo => {
        const produto = grupo.produto;
        const orcamentos = grupo.orcamentos;
        const analiseTemporalData = grupo.analisetemporal;
        
        if (!produto || !produto.idProduto) {
            console.error('Produto inválido no grupo:', grupo);
            return;
        }
        
        const produtoId = produto.idProduto;
        
        // Estruturar dados para compatibilidade com código existente
        orcamentosPorProduto[produtoId] = {
            produto: {
                id: produto.idProduto,
                nome: produto.nomeProduto,
                descricao: produto.descricaoProduto,
                unimedida: {
                    sigla: produto.unidadeAbreviacao
                }
            },
            orcamentos: orcamentos,
            analiseTemporalData: analiseTemporalData
        };
        
        // Extrair apenas os dados de orçamento da nova estrutura
        const orcamentosLimpos = orcamentos.map(item => {
            return item.dadosOrcamento || item; // Extrair dadosOrcamento se existe, senão usar o item diretamente
        }).filter(orcamento => orcamento && orcamento.idOrcamento); // Filtrar orçamentos válidos
        
        // Calcular e selecionar automaticamente o melhor orçamento
        const melhorOrcamento = calcularMelhorOrcamento(orcamentosLimpos);
        if (melhorOrcamento && melhorOrcamento.idOrcamento) {
            // ARMAZENAR o melhor orçamento para usar na renderização
            orcamentosPorProduto[produtoId].melhorOrcamentoCalculado = melhorOrcamento;
            
            selecoes[produtoId] = melhorOrcamento.idOrcamento.toString();
        }
    });

    // Atualizar interface após seleção automática
    atualizarBotaoGerar();
    atualizarEstatisticas();

    renderizarOrcamentos();
    atualizarEstatisticas();
    mostrarActionsDiv();
}

/**
 * Calcula o melhor orçamento baseado nos critérios de peso definidos:
 * 1. Valor Unitário (peso 4) - menor é melhor
 * 2. Data da entrega (peso 3) - mais cedo é melhor  
 * 3. Condições de pagamento (peso 2) - mais prazo é melhor
 * 4. Garantia (peso 1) - mais tempo é melhor
 */
function calcularMelhorOrcamento(orcamentos) {
    if (!orcamentos || orcamentos.length === 0) return null;
    if (orcamentos.length === 1) return orcamentos[0];

    // ALGORITMO SIMPLES: SEMPRE ESCOLHE O MENOR PREÇO
    let melhorOrcamento = null;
    let menorPreco = Infinity;

    orcamentos.forEach(orcamento => {
        // Verificação de segurança
        if (!orcamento || !orcamento.precoCompra) {
            console.warn('Orçamento com preço inválido:', orcamento);
            return;
        }
        
        const precoAtual = parseFloat(orcamento.precoCompra.toString().replace(',', '.')) || 0;
        
        if (precoAtual < menorPreco) {
            menorPreco = precoAtual;
            melhorOrcamento = orcamento;
        }
    });

    return melhorOrcamento;
}

/**
 * Extrai o prazo de pagamento em dias de um texto
 */
function extrairPrazoPagamento(texto) {
    if (!texto) return 0;
    
    const textoLower = texto.toLowerCase();
    
    // Procura por padrões como "30 dias", "15 dias", etc.
    const match = textoLower.match(/(\d+)\s*dias?/);
    if (match) {
        return parseInt(match[1]);
    }
    
    // Se contém "à vista" ou similar, considera 0 dias
    if (textoLower.includes('vista') || textoLower.includes('avista')) {
        return 0;
    }
    
    // Se contém palavras como "parcelado", "prazo", assume algum prazo
    if (textoLower.includes('parcelado') || textoLower.includes('prazo')) {
        return 30; // valor padrão
    }
    
    return 0;
}

/**
 * Extrai o tempo de garantia em meses de um texto
 */
function extrairTempoGarantia(texto) {
    if (!texto) return 0;
    
    const textoLower = texto.toLowerCase();
    
    // Procura por padrões como "12 meses", "6 meses", etc.
    const matchMeses = textoLower.match(/(\d+)\s*mes(?:es)?/);
    if (matchMeses) {
        return parseInt(matchMeses[1]);
    }
    
    // Procura por padrões como "1 ano", "2 anos", etc. e converte para meses
    const matchAnos = textoLower.match(/(\d+)\s*anos?/);
    if (matchAnos) {
        return parseInt(matchAnos[1]) * 12;
    }
    
    return 0;
}



/**
 * Extrai o tempo de garantia em meses de um texto
 */
function extrairTempoGarantia(texto) {
    if (!texto) return 0;
    
    const textoLower = texto.toLowerCase();
    
    // Procura por padrões como "12 meses", "6 meses", etc.
    const matchMeses = textoLower.match(/(\d+)\s*mes(?:es)?/);
    if (matchMeses) {
        return parseInt(matchMeses[1]);
    }
    
    // Procura por padrões como "1 ano", "2 anos", etc.
    const matchAnos = textoLower.match(/(\d+)\s*anos?/);
    if (matchAnos) {
        return parseInt(matchAnos[1]) * 12; // converte anos para meses
    }
    
    // Se contém "sem garantia" ou similar
    if (textoLower.includes('sem') && textoLower.includes('garantia')) {
        return 0;
    }
    
    return 0;
}

/**
 * Renderiza os orçamentos agrupados por produto
 */
function renderizarOrcamentos() {
    orcamentosContainer.innerHTML = '';

    Object.entries(orcamentosPorProduto).forEach(([produtoId, grupo]) => {
        const produtoDiv = document.createElement('div');
        produtoDiv.className = 'produto-group';
        produtoDiv.innerHTML = criarHtmlProduto(grupo);
        orcamentosContainer.appendChild(produtoDiv);
    });

    // Adicionar event listeners para os radio buttons
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const produtoId = this.name.replace('produto_', '');
            const orcamentoId = this.value;
            selecoes[produtoId] = orcamentoId;
            
            atualizarVisualizacaoSelecao(produtoId, orcamentoId);
            atualizarBotaoGerar();
            atualizarEstatisticas();
        });
    });
}

/**
 * Cria o HTML para um grupo de produto
 */
function criarHtmlProduto(grupo) {
    const produto = grupo.produto;
    const orcamentos = grupo.orcamentos;
    const analiseTemporalData = grupo.analiseTemporalData;

    // Verificação de segurança para evitar o erro "Cannot read properties of undefined"
    if (!produto || produto.id === undefined) {
        console.error('Produto inválido:', produto);
        return '<div class="error">Erro: Produto inválido</div>';
    }
    
    // USAR o melhor orçamento já calculado (NUNCA recalcular!)
    const grupoAtual = orcamentosPorProduto[produto.id];
    const melhorOrcamentoAtual = grupoAtual?.melhorOrcamentoCalculado || null;
    const melhorOrcamentoIdAtual = melhorOrcamentoAtual ? melhorOrcamentoAtual.idOrcamento : null;
    
    // Análise temporal removida - usando apenas análise individual por fornecedor

    let html = `
        <div class="produto-header">
            <div class="produto-title">${produto.nome} (${produto.unimedida.sigla})</div>
            <div class="produto-meta">
                <span class="produto-meta-item"><strong>Descrição:</strong> ${produto.descricao || 'Não informada'}</span>
                <span class="produto-meta-item"><strong>Quantidade de Cotações:</strong> ${orcamentos.length}</span>
            </div>
        </div>
        <div class="orcamentos-container">
    `;

    // USAR o melhor orçamento já calculado (NUNCA recalcular!)
    const grupoProdutoRender = orcamentosPorProduto[produto.id];
    const melhorOrcamentoRender = grupoProdutoRender?.melhorOrcamentoCalculado || null;
    const melhorOrcamentoIdRender = melhorOrcamentoRender ? melhorOrcamentoRender.idOrcamento : null;
    
    orcamentos.forEach((orcamentoInfo, index) => {
        // Extrair dados do orçamento e análise histórica do fornecedor
        const orcamento = orcamentoInfo.dadosOrcamento || orcamentoInfo; // Compatibilidade com estrutura antiga
        const historicoFornecedor = orcamentoInfo.historicoFornecedor || null;
        
        // Verificação de segurança para evitar erros
        if (!orcamento || !orcamento.idOrcamento) {
            console.error('Orçamento inválido:', orcamentoInfo);
            return; // Pular este orçamento inválido
        }
        
        const isChecked = selecoes[produto.id] === orcamento.idOrcamento.toString();
        const isRecomendado = orcamento.idOrcamento === melhorOrcamentoIdRender;
        const rowClass = isChecked ? 'selected' : '';
        
        // Criar badge inline para histórico do fornecedor
        let historicoHtml = '';
        if (historicoFornecedor) {
            const isAlertaFornecedor = historicoFornecedor.isAlerta === true || historicoFornecedor.isAlerta === 'true';
            
            if (historicoFornecedor.totalEntregas > 0) {
                const classeCor = isAlertaFornecedor ? 'badge-alerta' : 'badge-ok';
                const dp = historicoFornecedor.desvioPadrao.toFixed(2).replace('.', ',');
                historicoHtml = `<span class="badge-historico ${classeCor}">Desvio Padrão: ${dp} dias</span>`;
            } else {
                historicoHtml = `<span class="badge-historico badge-neutro">Sem histórico</span>`;
            }
        }
        
        html += `
            <div class="orcamento-card-compact ${rowClass}" data-orcamento-id="${orcamento.idOrcamento}">
                <div class="card-line">
                    <input type="radio" 
                           class="card-radio"
                           name="produto_${produto.id}" 
                           value="${orcamento.idOrcamento}"
                           ${isChecked ? 'checked' : ''}>
                    
                    <span class="fornecedor-nome-compact">${orcamento.nomeFornecedor}</span>
                    
                    <div class="badges-container">
                        ${isRecomendado ? '<span class="badge-recomendado">RECOMENDADO</span>' : ''}
                        ${historicoHtml}
                    </div>
                    
                    <div class="info-fields">
                        <div class="info-badge">
                            <div class="info-label">Valor Unit</div>
                            <div class="info-value">R$ ${formatarMoeda(orcamento.precoCompra)}</div>
                        </div>
                        <div class="info-badge">
                            <div class="info-label">Qtd</div>
                            <div class="info-value">${orcamento.quantidade}</div>
                        </div>
                        <div class="info-badge">
                            <div class="info-label">Total</div>
                            <div class="info-value">R$ ${formatarMoeda(orcamento.valorTotal)}</div>
                        </div>
                        <div class="info-badge">
                            <div class="info-label">Entrega</div>
                            <div class="info-value">${formatarData(orcamento.dataEntrega)}</div>
                        </div>
                        <div class="info-badge">
                            <div class="info-label">Pagto</div>
                            <div class="info-value">${orcamento.condicoesPagamento || '-'}</div>
                        </div>
                        <div class="info-badge">
                            <div class="info-label">Garantia</div>
                            <div class="info-value">${orcamento.garantia || '-'}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    html += `
        </div>
    `;

    return html;
}

/**
 * Atualiza a visualização da linha selecionada
 */
function atualizarVisualizacaoSelecao(produtoId, orcamentoId) {
    // Remove seleção anterior
    document.querySelectorAll(`input[name="produto_${produtoId}"]`).forEach(radio => {
        const card = radio.closest('.orcamento-card-compact');
        if (card) {
            card.classList.remove('selected');
        }
    });

    // Adiciona seleção atual
    const radioSelecionado = document.querySelector(`input[name="produto_${produtoId}"][value="${orcamentoId}"]`);
    if (radioSelecionado) {
        const card = radioSelecionado.closest('.orcamento-card-compact');
        if (card) {
            card.classList.add('selected');
        }
    }
}

/**
 * Atualiza o estado do botão de gerar ordens
 */
function atualizarBotaoGerar() {
    const totalProdutos = Object.keys(orcamentosPorProduto).length;
    const totalSelecionados = Object.keys(selecoes).length;
    
    // Permitir gerar se pelo menos um orçamento estiver selecionado
    gerarOcBtn.disabled = totalSelecionados === 0;
    
    if (totalSelecionados > 1) {
        gerarOcBtn.textContent = `Gerar ${totalSelecionados} Ordens de Compra`;
    } else {
        // Para 0 ou 1 selecionado, sempre singular
        gerarOcBtn.textContent = 'Gerar Ordem de Compra';
    }
}

/**
 * Atualiza as estatísticas do painel
 */
function atualizarEstatisticas() {
    const totalProdutos = Object.keys(orcamentosPorProduto).length;
    const totalCotacoes = Object.values(orcamentosPorProduto)
        .reduce((sum, grupo) => sum + grupo.orcamentos.length, 0);
    const totalSelecionados = Object.keys(selecoes).length;

    document.getElementById('statProdutos').textContent = totalProdutos;
    document.getElementById('statCotacoes').textContent = totalCotacoes;
    document.getElementById('statSelecionados').textContent = totalSelecionados;
}

/**
 * Gera as ordens de compra com base nas seleções
 */
async function gerarOrdensDeCompra() {
    if (loading) return;

    try {
        loading = true;
        gerarOcBtn.disabled = true;
        
        const totalSelecionados = Object.keys(selecoes).length;
        if (totalSelecionados > 1) {
            gerarOcBtn.textContent = 'Gerando Ordens...';
        } else {
            gerarOcBtn.textContent = 'Gerando Ordem...';
        }
        
        hideMessages();

        // Processar orçamentos selecionados (apenas dados reais do banco)
        const orcamentoIds = Object.values(selecoes).map(id => parseInt(id));
        
        console.log('IDs dos orçamentos selecionados:', orcamentoIds);
        
        if (orcamentoIds.length === 0) {
            showError('Nenhum orçamento real selecionado. Verifique suas seleções.');
            return;
        }

        const response = await fetch('/api/ordens-de-compra/processar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orcamentoIds)
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
        }

        // O endpoint /processar retorna JSON com mensagem de sucesso
        const result = await response.json();
        
        if (totalSelecionados > 1) {
            showSuccess('Ordens de compra processadas com sucesso! Status atualizados para aprovado.');
        } else {
            showSuccess('Ordem de compra processada com sucesso! Status atualizado para aprovado.');
        }
        
        // Limpar seleções e atualizar interface imediatamente
        selecoes = {};
        orcamentosPorProduto = {};
        
        // Atualizar contadores e esconder botão
        atualizarBotaoGerar();
        atualizarEstatisticas();
        actionsDiv.style.display = 'none';
        statsDiv.style.display = 'none';
        
        // Mostrar mensagem de "sem dados"
        mostrarSemDados();
        
        // Recarregar os orçamentos após um delay
        setTimeout(() => {
            carregarOrcamentos();
        }, 2000);

    } catch (error) {
        console.error('Erro ao gerar ordens de compra:', error);
        if (totalSelecionados > 1) {
            showError('Erro ao gerar ordens de compra: ' + error.message);
        } else {
            showError('Erro ao gerar ordem de compra: ' + error.message);
        }
    } finally {
        loading = false;
        atualizarBotaoGerar();
    }
}

/**
 * Utilitários de interface
 */
function mostrarLoading(show) {
    loadingDiv.style.display = show ? 'block' : 'none';
}

function mostrarActionsDiv() {
    actionsDiv.style.display = 'block';
    statsDiv.style.display = 'flex';
}

function mostrarSemDados() {
    orcamentosContainer.innerHTML = `
        <div class="no-data">
            Não há orçamentos pendentes de aprovação no momento.
        </div>
    `;
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    successDiv.style.display = 'none';
}

function showSuccess(message) {
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    errorDiv.style.display = 'none';
}

function hideMessages() {
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
}

function formatarMoeda(valor) {
    // Converter string com vírgula para número
    let numeroValor = typeof valor === 'string' ? parseFloat(valor.replace(',', '.')) : valor;
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(numeroValor);
}

function formatarData(dataString) {
    if (!dataString) return '-';
    // Evitar problema de fuso horário tratando como data local
    const [ano, mes, dia] = dataString.split('T')[0].split('-');
    const data = new Date(ano, mes - 1, dia); // mes - 1 porque o mês no JS é 0-indexed
    return data.toLocaleDateString('pt-BR');
}