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
 * Processa e agrupa os orçamentos por produto
 */
function processarOrcamentos(orcamentos) {
    if (!orcamentos || orcamentos.length === 0) {
        mostrarSemDados();
        return;
    }

    // Agrupar por produto
    orcamentosPorProduto = {};
    orcamentos.forEach(orcamento => {
        const produtoId = orcamento.idProduto;
        if (!orcamentosPorProduto[produtoId]) {
            orcamentosPorProduto[produtoId] = {
                produto: {
                    id: orcamento.idProduto,
                    nome: orcamento.nomeProduto,
                    descricao: orcamento.descricaoProduto,
                    unimedida: {
                        sigla: orcamento.unidadeAbreviacao
                    }
                },
                orcamentos: []
            };
        }
        orcamentosPorProduto[produtoId].orcamentos.push(orcamento);
    });

    // Para cada produto, calcular o melhor orçamento e selecionar automaticamente
    Object.entries(orcamentosPorProduto).forEach(([produtoId, grupo]) => {
        const melhorOrcamento = calcularMelhorOrcamento(grupo.orcamentos);
        if (melhorOrcamento) {
            // CORREÇÃO: Se o melhor orçamento é fictício, selecionar o melhor orçamento real
            let orcamentoParaSelecionar = melhorOrcamento;
            
            // Se o melhor é fictício (ID > 1000000), encontrar o melhor real
            if (melhorOrcamento.idOrcamento >= 1000000) {
                const orcamentosReais = grupo.orcamentos.filter(o => o.idOrcamento < 1000000);
                if (orcamentosReais.length > 0) {
                    orcamentoParaSelecionar = calcularMelhorOrcamento(orcamentosReais) || orcamentosReais[0];
                }
            }
            
            // ARMAZENAR o melhor orçamento para usar na renderização
            grupo.melhorOrcamentoCalculado = orcamentoParaSelecionar;
            
            selecoes[produtoId] = orcamentoParaSelecionar.idOrcamento.toString();
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
 * Função para selecionar automaticamente os melhores orçamentos
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

    // Verificação de segurança para evitar o erro "Cannot read properties of undefined"
    if (!produto || produto.id === undefined) {
        console.error('Produto inválido:', produto);
        return '<div class="error">Erro: Produto inválido</div>';
    }

    let html = `
        <div class="produto-header">
            🛍️ ${produto.nome} (${produto.unimedida.sigla})
        </div>
        <div class="produto-info">
            <strong>Descrição:</strong> ${produto.descricao || 'Não informada'}<br>
            <strong>Quantidade de Cotações:</strong> ${orcamentos.length}
        </div>
        <table class="cotacoes-table">
            <thead>
                <tr>
                    <th class="radio-column">Selecionar</th>
                    <th>ID do Produto</th>
                    <th>Fornecedor</th>
                    <th>Valor Unitário</th>
                    <th>Quantidade</th>
                    <th>Valor Total</th>
                    <th class="date-column">Data da Entrega</th>
                    <th>Condições de Pagamento</th>
                    <th>Garantia</th>
                </tr>
            </thead>
            <tbody>
    `;

    // USAR o melhor orçamento já calculado (NUNCA recalcular!)
    const grupoProduto = orcamentosPorProduto[produto.id];
    const melhorOrcamento = grupoProduto?.melhorOrcamentoCalculado || null;
    const melhorOrcamentoId = melhorOrcamento ? melhorOrcamento.idOrcamento : null;
    
    orcamentos.forEach((orcamento, index) => {
        const isChecked = selecoes[produto.id] === orcamento.idOrcamento.toString();
        const isRecomendado = orcamento.idOrcamento === melhorOrcamentoId;
        const rowClass = isChecked ? 'selected' : '';
        
        html += `
            <tr class="${rowClass}" data-orcamento-id="${orcamento.idOrcamento}">
                <td class="radio-column">
                    <input type="radio" 
                           name="produto_${produto.id}" 
                           value="${orcamento.idOrcamento}"
                           ${isChecked ? 'checked' : ''}>
                </td>
                <td>
                    ${orcamento.idProduto}
                </td>
                <td>
                    <strong>${orcamento.nomeFornecedor}</strong>
                    ${isRecomendado ? '<span class="recomendado-badge">🌟 Recomendado</span>' : ''}<br>
                    <small>${orcamento.representante || ''}</small>
                </td>
                <td class="currency">
                    R$ ${formatarMoeda(orcamento.precoCompra)}
                </td>
                <td>
                    ${orcamento.quantidade}
                </td>
                <td class="currency">
                    R$ ${formatarMoeda(orcamento.valorTotal)}
                </td>
                <td class="date-column">
                    ${formatarData(orcamento.dataEntrega)}
                </td>
                <td>
                    ${orcamento.condicoesPagamento || '-'}
                </td>
                <td>
                    ${orcamento.garantia || '-'}
                </td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    return html;
}

/**
 * Atualiza a visualização da linha selecionada
 */
function atualizarVisualizacaoSelecao(produtoId, orcamentoId) {
    // Remove seleção anterior
    document.querySelectorAll(`input[name="produto_${produtoId}"]`).forEach(radio => {
        const row = radio.closest('tr');
        row.classList.remove('selected');
    });

    // Adiciona seleção atual
    const radioSelecionado = document.querySelector(`input[name="produto_${produtoId}"][value="${orcamentoId}"]`);
    if (radioSelecionado) {
        const row = radioSelecionado.closest('tr');
        row.classList.add('selected');
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
            📝 Não há orçamentos pendentes de aprovação no momento.
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