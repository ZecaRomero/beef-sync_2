@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
title Beef-Sync - Celular (jeito fácil)

echo.
echo ========================================================
echo   JEITO MAIS FACIL - Ver animais no celular
echo ========================================================
echo.
echo   Usa seu PostgreSQL local - sem Neon, sem migração
echo   PC precisa estar ligado quando acessar
echo.
echo ========================================================
echo.

echo Iniciando servidor e ngrok...
echo.
echo   - Servidor: porta 3020
echo   - ngrok: criando tunel
echo.
echo Aguarde 10 segundos...
echo.

start "Beef-Sync" cmd /k "cd /d "%~dp0" && npm run dev"
timeout /t 10 /nobreak >nul
start "ngrok" cmd /k "cd /d "%~dp0" && ngrok http 3020"

echo.
echo ========================================================
echo   PRONTO!
echo ========================================================
echo.
echo   1. Na janela "ngrok", procure "Forwarding" e COPIE a URL real
echo      (algo como https://a1b2c3d4.ngrok-free.app)
echo.
echo   2. NAO use abc123 - e so exemplo! Use a URL da janela ngrok
echo.
echo   3. No celular, abra: [SUA_URL]/a
echo   4. Digite Serie e RG, clique Buscar
echo.
echo ========================================================
pause
