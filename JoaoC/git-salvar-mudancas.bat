@echo off
REM ===================================
REM Script para salvar automaticamente
REM mudanças no GitHub
REM ===================================

echo.
echo ========================================
echo 💾 Salvando mudanças no GitHub...
echo ========================================
echo.

cd /d "%~dp0"

echo 📋 Adicionando arquivos...
git add .

echo.
echo ✍️ Criando commit...
set /p mensagem="Digite a mensagem do commit (ou Enter para usar padrão): "

if "%mensagem%"=="" (
    set "mensagem=Atualização automática - %date% %time%"
)

git commit -m "%mensagem%"

echo.
echo 🚀 Enviando para GitHub...
git push origin feature/joao-controle-pedido

echo.
echo ========================================
echo ✅ Mudanças salvas com sucesso!
echo ========================================
echo.
pause
