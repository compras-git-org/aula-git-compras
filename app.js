// Estado da aplicação
let items = JSON.parse(localStorage.getItem('shopping_items')) || [];
let selectedCategoryFilter = 'Todos';

// Elementos do DOM
const itemForm = document.getElementById('item-form');
const itemNameInput = document.getElementById('item-name');
const itemCategoryInput = document.getElementById('item-category');
const itemQtyInput = document.getElementById('item-qty');
const itemPriceInput = document.getElementById('item-price');
const shoppingList = document.getElementById('shopping-list');
const emptyState = document.getElementById('empty-state');
const totalItemsEl = document.getElementById('total-items');
const totalValueEl = document.getElementById('total-value');
const btnClear = document.getElementById('btn-clear');
const filterChipsContainer = document.getElementById('filter-chips');

// Formata valores para o padrão de moeda brasileiro (BRL)
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

// Salva lista no localStorage
function saveItems() {
  localStorage.setItem('shopping_items', JSON.stringify(items));
}

// Atualiza a renderização da lista e os totais
function render() {
  shoppingList.innerHTML = '';

  // Filtra itens pela categoria selecionada
  const filteredItems = selectedCategoryFilter === 'Todos'
    ? items
    : items.filter((item) => (item.category || 'Outros') === selectedCategoryFilter);

  if (items.length === 0) {
    emptyState.style.display = 'block';
    emptyState.textContent = 'Sua lista está vazia. Adicione itens acima!';
  } else if (filteredItems.length === 0) {
    emptyState.style.display = 'block';
    emptyState.textContent = `Nenhum item encontrado na categoria "${selectedCategoryFilter}".`;
  } else {
    emptyState.style.display = 'none';
  }

  // Renderiza itens filtrados
  filteredItems.forEach((item) => {
    const itemTotal = item.qty * item.price;

    const li = document.createElement('li');
    li.className = `shopping-item ${item.purchased ? 'purchased' : ''}`;

    li.innerHTML = `
      <div class="item-left">
        <input 
          type="checkbox" 
          class="item-checkbox" 
          ${item.purchased ? 'checked' : ''} 
          aria-label="Marcar como comprado"
        />
        <div class="item-info">
          <div class="item-title-row">
            <span class="item-title">${escapeHtml(item.name)}</span>
            <span class="category-badge">${escapeHtml(item.category || 'Outros')}</span>
          </div>
          <span class="item-meta">Qtd: ${item.qty} ${item.price > 0 ? `× ${formatCurrency(item.price)}` : ''}</span>
        </div>
      </div>
      <div class="item-right">
        <span class="item-total">${itemTotal > 0 ? formatCurrency(itemTotal) : '-'}</span>
        <button class="btn-delete" title="Excluir item">&times;</button>
      </div>
    `;

    // Evento de marcar como comprado
    const checkbox = li.querySelector('.item-checkbox');
    checkbox.addEventListener('change', () => {
      item.purchased = checkbox.checked;
      saveItems();
      render();
    });

    // Evento de excluir item
    const btnDelete = li.querySelector('.btn-delete');
    btnDelete.addEventListener('click', () => {
      items = items.filter((i) => i.id !== item.id);
      saveItems();
      render();
    });

    shoppingList.appendChild(li);
  });

  // Cálculo dos totais
  let totalQty = 0;
  let totalPrice = 0;
  items.forEach((item) => {
    totalQty += item.qty;
    totalPrice += item.qty * item.price;
  });

  if (selectedCategoryFilter !== 'Todos') {
    let filteredQty = 0;
    let filteredPrice = 0;
    filteredItems.forEach((item) => {
      filteredQty += item.qty;
      filteredPrice += item.qty * item.price;
    });
    totalItemsEl.textContent = `${filteredQty} (${totalQty} no total)`;
    totalValueEl.textContent = `${formatCurrency(filteredPrice)} (${formatCurrency(totalPrice)} no total)`;
  } else {
    totalItemsEl.textContent = totalQty;
    totalValueEl.textContent = formatCurrency(totalPrice);
  }
}

// Evita injeção básica de caracteres
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Manipulador do formulário
itemForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = itemNameInput.value.trim();
  const category = itemCategoryInput.value || 'Outros';
  const qty = parseInt(itemQtyInput.value, 10) || 1;
  const price = parseFloat(itemPriceInput.value) || 0;

  if (!name) return;

  const newItem = {
    id: Date.now().toString(),
    name,
    category,
    qty,
    price,
    purchased: false
  };

  items.push(newItem);
  saveItems();
  render();

  // Resetar formulário
  itemForm.reset();
  itemQtyInput.value = '1';
  itemCategoryInput.value = category; // Mantém a última categoria usada
  itemNameInput.focus();
});

// Manipulador dos filtros por categoria
filterChipsContainer.addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;

  document.querySelectorAll('.filter-chips .chip').forEach((c) => c.classList.remove('active'));
  chip.classList.add('active');

  selectedCategoryFilter = chip.dataset.category;
  render();
});

// Limpar todos os itens
btnClear.addEventListener('click', () => {
  if (items.length === 0) return;

  if (confirm('Tem certeza de que deseja limpar todos os itens da lista?')) {
    items = [];
    saveItems();
    render();
  }
});

// Inicialização
render();
