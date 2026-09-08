@echo off
chcp 65001 >nul
title Khởi Động Wildwood TCG - Game Thẻ Bài Quái Thú Rừng Sâu

echo ==========================================================
echo       🌲 WILDWOOD MONSTER TCG - ROGUELIKE DECKBUILDER
echo ==========================================================
echo.
echo  Đang khởi động trò chơi trong trình duyệt web của bạn...
echo  Vui lòng giữ cửa sổ này trong khi chơi. Đóng lại để thoát.
echo.
echo ==========================================================

powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0launcher.ps1"
pause
