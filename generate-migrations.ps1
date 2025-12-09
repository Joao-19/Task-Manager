<#
.SYNOPSIS
    Script de Automação de Migrations com UI aprimorada.
#>

# ==========================================
# CONFIGURAÇÃO DE ESTILO E FUNÇÕES AUXILIARES
# ==========================================

# Define o título da janela do terminal
$Host.UI.RawUI.WindowTitle = "Jungle Task Manager - Migration Tool"

# Função para desenhar o Banner (ASCII Art)
function Show-Banner {
    Clear-Host
    $banner = @"
 _________  ________  ________  ___  __            _____ ______   ________  ________   ________  ________  _______   ________     
|\___   ___\\   __  \|\   ____\|\  \|\  \         |\   _ \  _   \|\   __  \|\   ___  \|\   __  \|\   ____\|\  ___ \ |\   __  \    
\|___ \  \_\ \  \|\  \ \  \___|\ \  \/  /|_       \ \  \\\__\ \  \ \  \|\  \ \  \\ \  \ \  \|\  \ \  \___|\ \   __/|\ \  \|\  \   
     \ \  \ \ \   __  \ \_____  \ \   ___  \       \ \  \\|__| \  \ \   __  \ \  \\ \  \ \   __  \ \  \  __\ \  \_|/_\ \   _  _\  
      \ \  \ \ \  \ \  \|____|\  \ \  \\ \  \       \ \  \    \ \  \ \  \ \  \ \  \\ \  \ \  \ \  \ \  \|\  \ \  \_|\ \ \  \\  \| 
       \ \__\ \ \__\ \__\____\_\  \ \__\\ \__\       \ \__\    \ \__\ \__\ \__\ \__\\ \__\ \__\ \__\ \_______\ \_______\ \__\\ _\ 
        \|__|  \|__|\|__|\_________\|__| \|__|        \|__|     \|__|\|__|\|__|\|__| \|__|\|__|\|__|\|_______|\|_______|\|__|\|__|
                        \|_________|                                                                                              
                                          
              MIGRATION CLI v1.0
"@
    Write-Host $banner -ForegroundColor Cyan
    Write-Host "===================================================================================================================================" -ForegroundColor DarkCyan
    Write-Host ""
}

# Função para exibir passos com ícones
function Write-Step {
    param([string]$Message, [string]$Step)
    Write-Host " [$Step] " -NoNewline -ForegroundColor Magenta
    Write-Host $Message -ForegroundColor White
}

# Função para sucesso
function Write-Success {
    param([string]$Message)
    Write-Host "    [OK] $Message" -ForegroundColor Green
    Write-Host ""
}

# Função para erro crítico
function Write-ErrorAndExit {
    param([string]$Message)
    Write-Host ""
    Write-Host "    [ERRO] $Message" -ForegroundColor Red -BackgroundColor Black
    Write-Host ""
    exit 1
}

# Função de timer visual (Barra de progresso real)
function Start-VisualTimer {
    param([int]$Seconds, [string]$Activity)
    
    for ($i = 1; $i -le $Seconds; $i++) {
        $percent = ($i / $Seconds) * 100
        Write-Progress -Activity $Activity -Status "Aguardando banco de dados... ($i/$Seconds s)" -PercentComplete $percent
        Start-Sleep -Seconds 1
    }
    Write-Progress -Activity $Activity -Completed
}

# ==========================================
# INÍCIO DO SCRIPT
# ==========================================

$StopWatch = [System.Diagnostics.Stopwatch]::StartNew()
Show-Banner

# --- MENU INICIAL ---
Write-Host "Escolha uma opcao:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  [1] Limpar banco e recriar do ZERO" -ForegroundColor Red
Write-Host "      (docker-compose down -v + gera migrations)" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  [2] Sincronizar (preservar dados)" -ForegroundColor Green
Write-Host "      (apenas gera migrations, nao apaga nada)" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Opcao (1 ou 2): " -NoNewline -ForegroundColor Yellow
$mode = Read-Host

if ($mode -ne '1' -and $mode -ne '2') {
    Write-Host ""
    Write-Host "[ERRO] Opcao invalida! Use 1 ou 2." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "====================================================" -ForegroundColor DarkCyan
if ($mode -eq '1') {
    Write-Host "   Modo: LIMPAR E RECRIAR" -ForegroundColor Red
}
else {
    Write-Host "   Modo: SINCRONIZAR (preserva dados)" -ForegroundColor Green
}
Write-Host "====================================================" -ForegroundColor DarkCyan
Write-Host ""

# --- PASSO 1 ---
if ($mode -eq '1') {
    Write-Step "Reiniciando ambiente Docker..." "1/4"
    try {
        docker compose down -v 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "Falha ao derrubar containers" }
        Write-Success "Containers parados e volumes limpos."
    }
    catch {
        Write-ErrorAndExit $_
    }
}
else {
    Write-Step "Pulando limpeza do banco..." "1/4"
    Write-Success "Dados preservados (modo sincronizacao)."
}

# --- PASSO 2 ---
Write-Step "Subindo Banco de Dados e Fila..." "2/4"
try {
    docker compose up -d db rabbitmq 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "Falha ao subir containers de infra" }
    
    # Barra de progresso
    Start-VisualTimer -Seconds 15 -Activity "Inicializando PostgreSQL"
    
    Write-Success "Infraestrutura pronta!"
}
catch {
    Write-ErrorAndExit $_
}

# --- PASSO 3 ---
Write-Step "Gerando Migrations nos Microsservicos..." "3/4"

# Lista de serviços
$Services = @("auth-service", "tasks-service", "notifications-service")

foreach ($Service in $Services) {
    Write-Host "    >> Processando: " -NoNewline -ForegroundColor Cyan
    Write-Host $Service -ForegroundColor Yellow
    
    Push-Location "apps\$Service"
    
    try {
        pnpm migration:generate src/migrations/InitialSchema 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "Erro ao gerar migration em $Service" }
        Write-Host "       -> Migration criada com sucesso." -ForegroundColor DarkGray
    }
    catch {
        Pop-Location
        Write-ErrorAndExit "Falha ao rodar pnpm em $Service"
    }
    
    Pop-Location
}
Write-Success "Todas as migrations foram geradas."

# --- PASSO 4 ---
Write-Step "Validando Status..." "4/4"

foreach ($Service in $Services) {
    Push-Location "apps\$Service"
    Write-Host "    [?] $Service : " -NoNewline -ForegroundColor Cyan
    
    $output = pnpm migration:show 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK (Sincronizado)" -ForegroundColor Green
    }
    else {
        Write-Host "PENDENTE" -ForegroundColor Red
    }
    Pop-Location
}

$StopWatch.Stop()
$Time = $StopWatch.Elapsed.ToString('mm\:ss')

Write-Host ""
Write-Host "====================================================" -ForegroundColor DarkCyan
Write-Host "   [COMPLETO] PROCESSO FINALIZADO EM $Time" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor DarkCyan
Write-Host ""

# --- PERGUNTA INTERATIVA ---
Write-Host "Deseja aplicar as migrations agora? (S/N): " -NoNewline -ForegroundColor Yellow
$response = Read-Host

if ($response -eq 'S' -or $response -eq 's') {
    Write-Host ""
    Write-Step "Aplicando Migrations..." "5/5"
    
    foreach ($Service in $Services) {
        Write-Host "    >> Aplicando em: " -NoNewline -ForegroundColor Cyan
        Write-Host $Service -ForegroundColor Yellow
        
        Push-Location "apps\$Service"
        
        try {
            pnpm migration:run 2>&1 | Out-Null
            if ($LASTEXITCODE -ne 0) { throw "Erro ao aplicar migrations em $Service" }
            Write-Host "       -> Migrations aplicadas com sucesso." -ForegroundColor DarkGray
        }
        catch {
            Pop-Location
            Write-ErrorAndExit "Falha ao aplicar migrations em $Service"
        }
        
        Pop-Location
    }
    
    Write-Success "Todas as migrations foram aplicadas ao banco de dados!"
}
else {
    Write-Host ""
    Write-Host "    [INFO] Migrations NAO foram aplicadas." -ForegroundColor Yellow
    Write-Host "    Para aplicar manualmente depois, use:" -ForegroundColor DarkGray
    Write-Host "    cd apps/SERVICO && pnpm migration:run" -ForegroundColor DarkGray
    Write-Host ""
}
