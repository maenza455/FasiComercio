const inputUsuario = document.getElementById('usuario');
const inputSenha = document.getElementById('senha');
const btnLogin = document.getElementById('btnLogin');
const errorUsuario = document.getElementById('error-usuario');
const errorSenha = document.getElementById('error-senha');
const errorLogin = document.getElementById('login-error-msg');
const successMsg = document.getElementById('success-msg');



function validarInputs() {
    const usuarioValido = inputUsuario.value.trim().length > 0;
    const senhaValida = inputSenha.value.trim().length > 0;

    btnLogin.disabled = !(usuarioValido && senhaValida);

    errorUsuario.style.display = usuarioValido ? 'none' : 'block';
    errorSenha.style.display = senhaValida ? 'none' : 'block';

    errorLogin.style.display = 'none';
    successMsg.style.display = 'none';
}

inputUsuario.addEventListener('input', validarInputs);
inputSenha.addEventListener('input', validarInputs);

async function fazerLogin() {
    errorLogin.style.display = 'none';
    successMsg.style.display = 'none';

    const usuarioDigitado = inputUsuario.value.trim();
    const senhaDigitada = inputSenha.value.trim();

    if (!usuarioDigitado || !senhaDigitada) {
        if (!usuarioDigitado) errorUsuario.style.display = 'block';
        if (!senhaDigitada) errorSenha.style.display = 'block';
        return;
    }

    try {
        const response = await fetch('http://localhost:5171/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: usuarioDigitado, password: senhaDigitada })
        });

        const data = await response.json();

        if (response.ok && data.authenticated) {
            successMsg.style.display = 'block';
            setTimeout(() => {
                window.location.href = "../../Sistema/Princ.html"; // Redirecionar para a página principal do sistema
            }, 1200);
        } else {
            errorLogin.style.display = 'block';
            inputSenha.value = ''; // Limpa o campo da senha
            inputSenha.focus(); // Foca no campo da senha para nova tentativa
        }
    } catch (error) {
        console.error('Erro ao tentar fazer login:', error);
        errorLogin.textContent = '❌ Erro de conexão com o servidor. Tente novamente.';
        errorLogin.style.display = 'block';
    }
}
