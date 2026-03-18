# 🚀 NEXUS NETWORK RECOVERY SCRIPT
# Ejecuta este script como ADMINISTRADOR para intentar desbloquear el acceso a GitHub.

Write-Host "--- INICIANDO DIAGNÓSTICO DE RED NEXUS ---" -ForegroundColor Cyan

# 1. Comprobar Privilegios
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "❌ ERROR: No eres ADMINISTRADOR. Cierra esto y ejecútalo como Administrador." -ForegroundColor Red
    pause
    exit
}

# 2. Desactivar Firewall temporalmente para prueba
Write-Host "🔓 Intentando desactivar Firewall de Windows (solo para prueba)..."
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False

# 3. Limpiar DNS y Rutas
Write-Host "🧹 Limpiando caché de DNS y tablas de rutas..."
ipconfig /flushdns
arp -d *

# 4. Probar Conectividad
Write-Host "📡 Probando conexión a GitHub..."
$ping = Test-NetConnection -ComputerName github.com -Port 443
if ($ping.TcpTestSucceeded) {
    Write-Host "✅ ¡ÉXITO! Conexión a GitHub restaurada." -ForegroundColor Green
    Write-Host "Intentando Git Push..."
    git push origin main
} else {
    Write-Host "❌ La red sigue bloqueada por fuera del PC (Router o ISP)." -ForegroundColor Yellow
    Write-Host "Incluso sin Firewall de Windows, el destino es inalcanzable."
}

# 5. Restaurar Firewall
Write-Host "🛡️ Restaurando perfiles de Firewall..."
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True

Write-Host "--- FIN DEL PROCESO ---"
pause
