@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

cd /d "%~dp0"

REM ========== PROJE ADI ==========
for %%I in ("%CD%") do set PROJECT_NAME=%%~nxI
title Commit + Push - !PROJECT_NAME!

REM ========== LOG EVERYTHING ==========
set LOG=%~dp0commit-push-coskun.log
echo. > "%LOG%"
echo [%DATE% %TIME%] Script started (project: !PROJECT_NAME!) >> "%LOG%"

echo.
echo ==========================================
echo   !PROJECT_NAME! - commit + push
echo ==========================================
echo.
echo Log dosyasi: %LOG%
echo.
echo [BASLAMAK ICIN BIR TUSA BAS]
pause

REM ========== 0) .git KONTROL ==========
if not exist ".git" goto :err_notgit

REM ========== 1) STALE LOCK TEMIZLE ==========
if not exist ".git\index.lock" goto :afterlock
echo [1/7] .git\index.lock bulundu, siliniyor...
echo [1/7] removing stale .git\index.lock >> "%LOG%"
del /f /q ".git\index.lock" 2>>"%LOG%"
if exist ".git\index.lock" goto :err_locknotremoved
:afterlock
echo [1/7] Lock temizligi tamam.

REM ========== 1b) PHANTOM WORKTREE TEMIZLE ==========
if not exist ".git\worktrees" goto :after1b
for /d %%W in (".git\worktrees\*") do call :check_phantom "%%W"
:after1b

REM ========== 1c) ORPHAN CLAUDE CODE WORKTREE TEMIZLE ==========
if not exist ".claude\worktrees" goto :after1c
set "GIT_WT_EMPTY=1"
if exist ".git\worktrees" (
    for /d %%W in (".git\worktrees\*") do set "GIT_WT_EMPTY=0"
)
if not "!GIT_WT_EMPTY!"=="1" (
    echo [1c/7] .git\worktrees'te aktif entry var, .claude\worktrees'e dokunmuyorum.
    goto :after1c
)
echo [1c/7] Orphan .claude\worktrees bulundu, siliniyor...
echo [1c/7] removing orphan .claude\worktrees >> "%LOG%"
rmdir /s /q ".claude\worktrees" 2>>"%LOG%"
:after1c

REM ========== 2) TARGET BRANCH TESPIT ==========
set TARGET=
git show-ref --verify --quiet refs/heads/coskun
if not errorlevel 1 set TARGET=coskun
if "!TARGET!"=="" git show-ref --verify --quiet refs/heads/main && set TARGET=main
if "!TARGET!"=="" git show-ref --verify --quiet refs/heads/master && set TARGET=master
if "!TARGET!"=="" for /f %%b in ('git branch --show-current 2^>^&1') do set TARGET=%%b
echo [2/7] Target branch: !TARGET!
echo [2/7] target=!TARGET! >> "%LOG%"

REM ========== 3) DOGRU BRANCH'E GEC ==========
for /f %%b in ('git branch --show-current 2^>^&1') do set CURBR=%%b
if /i "!CURBR!"=="!TARGET!" goto :afterbranch
echo [i] Su anda "!CURBR!" branch'indesin. !TARGET!'e geciyorum...
git checkout !TARGET! 1>>"%LOG%" 2>&1
if errorlevel 1 goto :err_checkout
:afterbranch

REM ========== 4) STATUS + ADD ==========
echo.
echo [3/7] Degisiklik listesi:
git status --short
git status --short >> "%LOG%"
echo.

echo [4/7] Tum degisiklikleri stage ediyorum...
echo [4/7] git add -A >> "%LOG%"
git add -A 1>>"%LOG%" 2>&1
if errorlevel 1 goto :err_add

REM ========== 5) COMMIT (auto timestamp mesaj) ==========
git diff --cached --quiet
if not errorlevel 1 goto :nochanges

set DT=
for /f "delims=" %%a in ('powershell -NoProfile -Command "Get-Date -Format yyyy-MM-dd_HH-mm"') do set DT=%%a
if "!DT!"=="" set DT=autostamp
set MSG=update: local changes on !TARGET! [!DT!]
echo [5/7] commit msg: !MSG!
echo [5/7] commit msg: !MSG! >> "%LOG%"
git commit -m "!MSG!" 1>>"%LOG%" 2>&1
if errorlevel 1 goto :commitwarn
echo [OK] Commit atildi.
goto :aftercommit

:commitwarn
echo [UYARI] Commit fail oldu, devam ediyorum. Log: %LOG%
echo [5/7] commit failed but continuing >> "%LOG%"
git status --short >> "%LOG%"
goto :aftercommit

:nochanges
echo [5/7] Commit edilecek bir degisiklik yok. Atliyorum.
echo [5/7] nothing to commit >> "%LOG%"

:aftercommit

REM ========== 6) FETCH + REBASE ==========
echo.
echo [6/7] Remote'dan guncel halini aliyorum (rebase + autostash)...
echo [6/7] git fetch + pull --rebase --autostash >> "%LOG%"
git fetch origin 1>>"%LOG%" 2>&1
git show-ref --verify --quiet refs/remotes/origin/!TARGET!
if errorlevel 1 (
    echo [i] Remote'ta !TARGET! yok, ilk push olacak.
    echo [6/7] remote branch yok, pull atlandi >> "%LOG%"
    goto :afterpull
)
git pull --rebase --autostash origin !TARGET! 1>>"%LOG%" 2>&1
if errorlevel 1 goto :err_rebase
:afterpull

REM ========== 7) PUSH ==========
echo.
echo [7/7] origin/!TARGET!'e push ediyorum...
echo [7/7] git push origin !TARGET! >> "%LOG%"
git push -u origin !TARGET! 1>>"%LOG%" 2>&1
if errorlevel 1 goto :err_push

REM ========== GITHUB URL ==========
set GHURL=
for /f "tokens=*" %%u in ('git remote get-url origin 2^>nul') do set GHURL=%%u
set GHURL=!GHURL:.git=!
echo !GHURL! | findstr "@" >nul
if not errorlevel 1 for /f "tokens=2 delims=@" %%a in ("!GHURL!") do set GHURL=https://%%a

echo.
echo ==========================================
echo   TAMAM - !TARGET! branch'i guncel.
echo ==========================================
echo.
if not "!GHURL!"=="" echo GitHub: !GHURL!/tree/!TARGET!
echo Log: %LOG%
echo.
echo [%DATE% %TIME%] Script completed OK >> "%LOG%"
pause
exit /b 0

REM ========================================================
REM   HATA KISIMLARI
REM ========================================================
:err_notgit
echo [HATA] Bu klasor bir git deposu degil.
pause
exit /b 1

:err_locknotremoved
echo [HATA] Lock silinemedi. Manuel sil:
echo         del "%~dp0.git\index.lock"
pause
exit /b 1

:err_checkout
echo [HATA] !TARGET! branch'ine gecilemedi. Log: %LOG%
pause
exit /b 1

:err_add
echo [HATA] git add basarisiz. Log: %LOG%
pause
exit /b 1

:err_rebase
echo.
echo [UYARI] Rebase sirasinda conflict var.
echo  1) Dosyalari duzenle
echo  2) git add ^<dosya^>
echo  3) git rebase --continue
echo Iptal: git rebase --abort
echo Log: %LOG%
pause
exit /b 1

:err_push
echo.
echo [HATA] Push basarisiz. PAT suresi dolmus olabilir.
echo Claude'a "PAT'i yenile" de. Log: %LOG%
pause
exit /b 1

REM ========================================================
REM   PHANTOM WORKTREE CHECK (subroutine)
REM ========================================================
:check_phantom
set "WT_DIR=%~1"
if not exist "!WT_DIR!\gitdir" exit /b 0
set "WT_PATH="
set /p WT_PATH=<"!WT_DIR!\gitdir"
if "!WT_PATH!"=="" exit /b 0
if exist "!WT_PATH!" exit /b 0
echo [1b/7] Phantom worktree siliniyor: !WT_DIR!
echo [1b/7] removing phantom worktree !WT_DIR! (gitdir was !WT_PATH!) >> "%LOG%"
rmdir /s /q "!WT_DIR!"
exit /b 0
