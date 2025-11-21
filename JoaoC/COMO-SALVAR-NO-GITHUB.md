# 🚀 Como Salvar Automaticamente no GitHub

## ✅ Configuração Atual

Seu projeto já está configurado para salvar em:
- **Repositório:** https://github.com/maenza455/FasiComercio
- **Branch:** `feature/joao-controle-pedido`
- **Pasta:** `JoaoC/`

---

## 📝 Formas de Salvar Mudanças

### 1️⃣ Forma Rápida - Usar o Script (RECOMENDADO)

Basta dar **duplo clique** no arquivo:
```
git-salvar-mudancas.bat
```

Ele vai:
1. ✅ Adicionar todas as mudanças
2. ✅ Pedir uma mensagem (ou usar automática)
3. ✅ Fazer commit
4. ✅ Enviar para o GitHub

---

### 2️⃣ Forma Manual - Terminal

Se preferir usar o terminal:

```powershell
# 1. Ir para a pasta do projeto
cd 'c:\Users\João Carlos Almeida\Documents\fasiclin-compras-main\JoaoC'

# 2. Adicionar mudanças
git add .

# 3. Fazer commit
git commit -m "Sua mensagem aqui"

# 4. Enviar para GitHub
git push origin feature/joao-controle-pedido
```

---

## 🔄 Trazer Mudanças do GitHub

Se fizer mudanças em outro computador, use:

```powershell
cd 'c:\Users\João Carlos Almeida\Documents\fasiclin-compras-main\JoaoC'
git pull origin feature/joao-controle-pedido
```

---

## ⚙️ Configuração Permanente

O projeto **JÁ ESTÁ** configurado permanentemente:
- Não precisa configurar nada novamente
- As mudanças sempre vão para o repositório correto
- A branch `feature/joao-controle-pedido` é mantida

---

## 📌 Dicas

✅ **Execute o script sempre que fizer mudanças importantes**  
✅ **Escreva mensagens de commit claras**  
✅ **Faça commits frequentes (não espere acumular muitas mudanças)**

---

## 🆘 Problemas Comuns

**"Preciso fazer login?"**
- O Git pode pedir seu usuário e senha do GitHub na primeira vez
- Use um Personal Access Token ao invés da senha

**"Conflito ao fazer push?"**
- Primeiro faça: `git pull origin feature/joao-controle-pedido`
- Depois faça: `git push origin feature/joao-controle-pedido`

---

**Última atualização:** 21/11/2025
