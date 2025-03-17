let carrinho = [];
let total = 0;


// Função para atualizar o carrinho e o total
function atualizarCarrinho() {
    const carrinhoElement = document.getElementById('itens-carrinho');
    const totalElement = document.getElementById('total');
    const contadorElement = document.getElementById('contador-itens');
    const contadorCarrinho = document.getElementById('contador-carrinho');
    carrinhoElement.innerHTML = '';
    let contadorItens = 0;
    
    carrinho.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.nome} - R$ ${item.preco} (Quantidade: ${item.quantidade})`;
        carrinhoElement.appendChild(li);
        contadorItens += item.quantidade;
    });
    
    totalElement.textContent = total.toFixed(2);
    contadorElement.textContent = contadorItens;
    contadorCarrinho.textContent = contadorItens;
}

// Função para adicionar itens ao carrinho
document.querySelectorAll('.adicionar-carrinho').forEach(button => {
    button.addEventListener('click', function() {
        const nome = this.getAttribute('data-nome');
        const preco = parseFloat(this.getAttribute('data-preco'));
        const itemExistente = carrinho.find(item => item.nome === nome);
        
        if (itemExistente) {
            itemExistente.quantidade++;
        } else {
            carrinho.push({ nome, preco, quantidade: 1 });
        }
        
        total += preco;
        atualizarCarrinho();
    });
});

// Função para abrir o carrinho
function abrirCarrinho() {
    document.getElementById('carrinho-aba').style.right = '0';
}

// Função para fechar o carrinho
document.getElementById('fechar-carrinho').addEventListener('click', function() {
    document.getElementById('carrinho-aba').style.right = '-550px';
});

// Função para finalizar o pedido via WhatsApp
document.getElementById('enviar-pedido').addEventListener('click', function() {
    const formaPagamento = document.querySelector('input[name="pagamento"]:checked').value;
    const itensMensagem = carrinho.map(item => `${item.nome} - ${item.quantidade}x R$ ${item.preco.toFixed(2)}`).join('%0A');
    const totalMensagem = `Total: R$ ${total.toFixed(2)}`;
    const pagamentoMensagem = `Forma de pagamento: ${formaPagamento}`;
    const mensagem = `${itensMensagem}%0A${totalMensagem}%0A${pagamentoMensagem}`;
    const link = `https://wa.me/5511999999999?text=${encodeURIComponent(mensagem)}`;
    window.open(link, '_blank');
});
