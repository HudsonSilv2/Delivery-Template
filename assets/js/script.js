let carrinho = [];
const TAXA_CARTAO = 0.015; // 1.5%
const TAXA_ENTREGA_BASE = 2.00;
const DISTANCIA_BASE = 3; // km

// Elementos do DOM
const carrinhoAba = document.getElementById('carrinho-aba');
const listaItens = document.getElementById('itens-carrinho');
const carrinhoVazio = document.getElementById('carrinho-vazio');
const btnFinalizarPedido = document.getElementById('enviar-pedido');
const formaPagamento = document.querySelector('.forma-pagamento');
const trocoSection = document.getElementById('troco-section');
const taxaCartaoDiv = document.getElementById('taxa-cartao-div');
const btnUsarMapa = document.getElementById('btn-usar-mapa');
const btnEnderecoManual = document.getElementById('btn-endereco-manual');
const formEndereco = document.getElementById('form-endereco');
const mapaContainer = document.getElementById('mapa-container');
const contadorCarrinho = document.getElementById('contador-carrinho');
const carrinhoItems = document.querySelector('.carrinho-items');

// Template do item do carrinho
const templateItemCarrinho = document.getElementById('template-item-carrinho');

// Função para abrir o carrinho
function abrirCarrinho() {
    carrinhoAba.classList.add('aberto');
    atualizarVisibilidadeCarrinhoVazio();
}

// Função para fechar o carrinho
function fecharCarrinho() {
    carrinhoAba.classList.remove('aberto');
}

// Função para adicionar item ao carrinho
function adicionarAoCarrinho(nome, preco) {
    const item = carrinho.find(i => i.nome === nome);
    
    if (item) {
        item.quantidade++;
    } else {
        carrinho.push({
            nome,
            preco: parseFloat(preco.replace(',', '.')),
            quantidade: 1
        });
    }
    
    atualizarCarrinho();
    abrirCarrinho();
}

// Função para remover item do carrinho
function removerDoCarrinho(nome) {
    const index = carrinho.findIndex(item => item.nome === nome);
    if (index !== -1) {
        carrinho.splice(index, 1);
        atualizarCarrinho();
    }
}

// Função para atualizar quantidade de um item
function atualizarQuantidade(nome, delta) {
    const item = carrinho.find(i => i.nome === nome);
    if (item) {
        const novaQuantidade = item.quantidade + delta;
        if (novaQuantidade <= 0) {
            removerDoCarrinho(nome);
        } else {
            item.quantidade = novaQuantidade;
            atualizarCarrinho();
        }
    }
}

// Função para atualizar o carrinho
function atualizarCarrinho() {
    // Limpa a lista
    listaItens.innerHTML = '';
    
    // Adiciona cada item
    carrinho.forEach(item => {
        const itemElement = templateItemCarrinho.content.cloneNode(true);
        
        itemElement.querySelector('.item-titulo').textContent = item.nome;
        itemElement.querySelector('.item-preco').textContent = 
            `R$ ${(item.preco * item.quantidade).toFixed(2)}`;
        itemElement.querySelector('.quantidade').textContent = item.quantidade;
        
        // Eventos dos botões
        const btnDiminuir = itemElement.querySelector('.diminuir');
        const btnAumentar = itemElement.querySelector('.aumentar');
        const btnRemover = itemElement.querySelector('.btn-remover');
        
        btnDiminuir.onclick = () => atualizarQuantidade(item.nome, -1);
        btnAumentar.onclick = () => atualizarQuantidade(item.nome, 1);
        btnRemover.onclick = () => removerDoCarrinho(item.nome);
        
        listaItens.appendChild(itemElement);
    });
    
    // Atualiza o contador do carrinho
    const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);
    contadorCarrinho.textContent = totalItens;
    
    atualizarResumo();
    atualizarVisibilidadeCarrinhoVazio();
}

// Função para atualizar o resumo do carrinho
function atualizarResumo() {
    const subtotal = carrinho.reduce((total, item) => 
        total + (item.preco * item.quantidade), 0);
    
    const formaPagamentoSelecionada = document.querySelector('input[name="pagamento"]:checked')?.value || 'dinheiro';
    const taxaCartao = formaPagamentoSelecionada === 'credito' ? subtotal * TAXA_CARTAO : 0;
    
    // Definir taxa de entrega padrão se não houver uma taxa calculada
    let taxaEntrega = TAXA_ENTREGA_BASE;
    const taxaEntregaElement = document.getElementById('taxa-entrega');
    if (taxaEntregaElement) {
        taxaEntregaElement.textContent = `R$ ${taxaEntrega.toFixed(2)}`;
    }
    
    const total = subtotal + taxaCartao + taxaEntrega;
    
    document.getElementById('subtotal').textContent = `R$ ${subtotal.toFixed(2)}`;
    document.getElementById('taxa-cartao').textContent = `R$ ${taxaCartao.toFixed(2)}`;
    document.getElementById('total').textContent = `R$ ${total.toFixed(2)}`;
    
    // Atualiza visibilidade da taxa do cartão
    taxaCartaoDiv.classList.toggle('hidden', formaPagamentoSelecionada !== 'credito');
    
    // Atualiza visibilidade da seção de troco
    trocoSection.classList.toggle('hidden', formaPagamentoSelecionada !== 'dinheiro');
    
    // Atualiza estado do botão finalizar
    const enderecoValido = formEndereco ? formEndereco.checkValidity() : false;
    btnFinalizarPedido.disabled = carrinho.length === 0 || !enderecoValido;
}

// Função para atualizar visibilidade do aviso de carrinho vazio
function atualizarVisibilidadeCarrinhoVazio() {
    const estaVazio = carrinho.length === 0;
    if (carrinhoVazio) carrinhoVazio.classList.toggle('hidden', !estaVazio);
    if (carrinhoItems) carrinhoItems.classList.toggle('hidden', estaVazio);
}

// Função para limpar o carrinho
function limparCarrinho() {
    carrinho = [];
    atualizarCarrinho();
    fecharCarrinho();
}

// Event Listeners
document.getElementById('fechar-carrinho')?.addEventListener('click', fecharCarrinho);

// Adiciona eventos para todos os botões de adicionar ao carrinho
document.querySelectorAll('.adicionar-carrinho').forEach(btn => {
    btn.addEventListener('click', () => {
        const nome = btn.dataset.nome;
        const preco = btn.dataset.preco;
        adicionarAoCarrinho(nome, preco);
    });
});

formaPagamento?.addEventListener('change', atualizarResumo);

btnUsarMapa?.addEventListener('click', () => {
    formEndereco.classList.add('hidden');
    mapaContainer.classList.remove('hidden');
});

btnEnderecoManual?.addEventListener('click', () => {
    mapaContainer.classList.add('hidden');
    formEndereco.classList.remove('hidden');
});

// Validação do CEP
document.getElementById('cep')?.addEventListener('input', function(e) {
    let cep = e.target.value.replace(/\D/g, '');
    
    if (cep.length === 8) {
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(response => response.json())
            .then(data => {
                if (!data.erro) {
                    document.getElementById('rua').value = data.logradouro;
                    document.getElementById('bairro').value = data.bairro;
                }
            })
            .catch(error => console.error('Erro ao buscar CEP:', error));
    }
});

// Validação do formulário de endereço
formEndereco?.addEventListener('input', () => {
    btnFinalizarPedido.disabled = carrinho.length === 0 || !formEndereco.checkValidity();
});

// Função para formatar a mensagem do WhatsApp
function formatarMensagemWhatsApp(pedido, endereco, formaPagamento) {
    const dataHora = new Date().toLocaleString('pt-BR');
    let mensagem = `🍔 *NOVO PEDIDO* 🍔\n`;
    mensagem += `\n📅 *Data e Hora:* ${dataHora}\n`;
    
    // Itens do pedido
    mensagem += `\n📋 *ITENS DO PEDIDO:*\n`;
    pedido.itens.forEach(item => {
        mensagem += `▫️ ${item.quantidade}x ${item.nome} `;
        mensagem += `- R$ ${(item.preco * item.quantidade).toFixed(2)}\n`;
    });
    
    // Subtotal e taxas
    const subtotal = pedido.itens.reduce((total, item) => 
        total + (item.preco * item.quantidade), 0);
    const taxaEntrega = parseFloat(document.getElementById('taxa-entrega')
        .textContent.replace('R$ ', ''));
    const formaPagamentoSelecionada = formaPagamento;
    const taxaCartao = formaPagamentoSelecionada === 'credito' ? subtotal * TAXA_CARTAO : 0;
    const total = subtotal + taxaCartao + taxaEntrega;

    mensagem += `\n💰 *RESUMO DO PEDIDO:*\n`;
    mensagem += `▫️ Subtotal: R$ ${subtotal.toFixed(2)}\n`;
    mensagem += `▫️ Taxa de Entrega: R$ ${taxaEntrega.toFixed(2)}\n`;
    if (taxaCartao > 0) {
        mensagem += `▫️ Taxa Cartão (1.5%): R$ ${taxaCartao.toFixed(2)}\n`;
    }
    mensagem += `▫️ *Total: R$ ${total.toFixed(2)}*\n`;

    // Forma de pagamento
    mensagem += `\n💳 *FORMA DE PAGAMENTO:*\n`;
    const pagamentoTexto = {
        'dinheiro': 'Dinheiro',
        'credito': 'Cartão de Crédito',
        'debito': 'Cartão de Débito',
        'pix': 'PIX'
    };
    mensagem += `▫️ ${pagamentoTexto[formaPagamentoSelecionada]}\n`;

    // Se for dinheiro, adiciona o troco
    if (formaPagamentoSelecionada === 'dinheiro') {
        const trocoInput = document.getElementById('troco-input');
        if (trocoInput && trocoInput.value) {
            const troco = parseFloat(trocoInput.value) - total;
            if (troco > 0) {
                mensagem += `▫️ Troco para: R$ ${trocoInput.value}\n`;
                mensagem += `▫️ Troco a devolver: R$ ${troco.toFixed(2)}\n`;
            }
        }
    }

    // Endereço de entrega
    mensagem += `\n📍 *ENDEREÇO DE ENTREGA:*\n`;
    mensagem += `▫️ ${endereco.rua}, ${endereco.numero}\n`;
    if (endereco.complemento) {
        mensagem += `▫️ Complemento: ${endereco.complemento}\n`;
    }
    mensagem += `▫️ Bairro: ${endereco.bairro}\n`;
    if (endereco.referencia) {
        mensagem += `▫️ Referência: ${endereco.referencia}\n`;
    }

    return encodeURIComponent(mensagem);
}

// Função para mostrar o popup de agradecimento
function mostrarPopupAgradecimento() {
    const popup = document.createElement('div');
    popup.className = 'popup-agradecimento';
    
    popup.innerHTML = `
        <div class="popup-conteudo">
            <div class="popup-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h2>Pedido Realizado com Sucesso!</h2>
            <p>Agradecemos a sua preferência! 😊</p>
            <p>Em breve você receberá a confirmação do seu pedido.</p>
            <p class="tempo-entrega">Tempo estimado de entrega: 30-45 minutos</p>
            <button class="btn-fechar-popup">OK</button>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    // Adiciona animação de entrada
    setTimeout(() => popup.classList.add('visible'), 100);
    
    // Fecha o popup ao clicar no botão
    popup.querySelector('.btn-fechar-popup').onclick = () => {
        popup.classList.remove('visible');
        setTimeout(() => popup.remove(), 300);
    };
}

// Atualiza o evento de finalizar pedido
btnFinalizarPedido?.addEventListener('click', () => {
    if (carrinho.length === 0) {
        alert('Adicione itens ao carrinho para finalizar o pedido.');
        return;
    }
    
    if (!formEndereco.checkValidity()) {
        alert('Por favor, preencha todos os campos obrigatórios do endereço.');
        return;
    }
    
    const formaPagamentoSelecionada = document.querySelector('input[name="pagamento"]:checked').value;
    const endereco = {
        cep: document.getElementById('cep').value,
        rua: document.getElementById('rua').value,
        numero: document.getElementById('numero').value,
        complemento: document.getElementById('complemento').value,
        bairro: document.getElementById('bairro').value,
        referencia: document.getElementById('referencia').value
    };
    
    const pedido = {
        itens: carrinho,
        formaPagamento: formaPagamentoSelecionada,
        endereco: endereco
    };

    // Formata a mensagem e envia para o WhatsApp
    const mensagem = formatarMensagemWhatsApp(pedido, endereco, formaPagamentoSelecionada);
    const numeroWhatsApp = '5584991633458'; // Número do WhatsApp do estabelecimento
    window.open(`https://wa.me/${numeroWhatsApp}?text=${mensagem}`);
    
    // Mostra o popup de agradecimento
    mostrarPopupAgradecimento();
    
    // Limpa o carrinho e fecha
    limparCarrinho();
});

// Funções do Modal
function abrirModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('aberto');
        document.body.style.overflow = 'hidden';
    }
}

function fecharModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('aberto');
        document.body.style.overflow = '';
    }
}

// Fecha o modal ao clicar fora dele
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        const modalId = e.target.id;
        fecharModal(modalId);
    }
});

// Fecha o modal ao pressionar ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modalAberto = document.querySelector('.modal.aberto');
        if (modalAberto) {
            fecharModal(modalAberto.id);
        }
    }
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    atualizarCarrinho();
});
