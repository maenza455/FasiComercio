let allProducts = [];
let currentPage = 1;
const itemsPerPage = 10;

// Função para mostrar toast
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

// Carregar produtos para tabela
async function loadProductsTable() {
  try {
    const response = await fetch('http://localhost:5170/api/products');
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

    const data = await response.json();
    allProducts = data.data || [];
    currentPage = 1;
    renderTable();
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
    document.querySelector('#productsTable tbody').innerHTML =
      '<tr><td colspan="4">Erro ao carregar produtos.</td></tr>';
  }
}

function renderTable() {
  const tbody = document.querySelector('#productsTable tbody');
  tbody.innerHTML = '';

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageItems = allProducts.slice(start, end);

  if (pageItems.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4">Nenhum produto encontrado.</td></tr>';
    return;
  }

  pageItems.forEach(prod => {
  const row = `
    <tr>
      <td>${prod.IDPRODUTO}</td>
      <td>${prod.NOME}</td>
      <td>${prod.DESCRICAO}</td>
    </tr>
  `;
  tbody.innerHTML += row;
});


  document.getElementById('pageInfo').textContent =
    `Página ${currentPage} de ${Math.ceil(allProducts.length / itemsPerPage)}`;
  document.getElementById('prevPage').disabled = currentPage === 1;
  document.getElementById('nextPage').disabled = end >= allProducts.length;
}

// Controles de paginação
document.getElementById('prevPage').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderTable();
  }
});
document.getElementById('nextPage').addEventListener('click', () => {
  if ((currentPage * itemsPerPage) < allProducts.length) {
    currentPage++;
    renderTable();
  }
});

// Navegação do menu
document.querySelectorAll('.btn-menu').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.btn-menu').forEach(btn => btn.classList.remove('active'));

    const targetId = button.dataset.target;
    const targetSection = document.getElementById(targetId);

    if (targetSection) {
      targetSection.classList.add('active');
      button.classList.add('active');

      if (targetId === 'produtos-section') loadProductsTable();
    }
  });
});

// Botão sair
document.querySelector('.btn-exit').addEventListener('click', () => {
  showToast("Saindo do sistema...");
  setTimeout(() => window.location.href = '/Cadastro e Login/login/Login.html', 2000);
});
