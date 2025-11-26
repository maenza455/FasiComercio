
const form = document.getElementById('cadastroForm');
form.addEventListener('submit', function (event) {
    event.preventDefault();


    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }


    alert('Cadastro realizado com sucesso!');
    window.location.href = '../Sistema/Princ.html';
});

function sair() {
    window.location.href = '../Login/Login.html';
}


document.querySelector('.btn-sair').addEventListener('click', () => {
    alert('Saindo do sistema...');

});


document.querySelector('.link-login').addEventListener('click', (ev) => {
    ev.preventDefault();
    alert('Navegar para a página de login.');

});

function fazerLogin() {
    window.location.href = '/Sistema/Princ.html';
}