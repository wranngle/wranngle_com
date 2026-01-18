# Wranngle Systems - Self-Healing Serveo Tunnel
$LocalPort = 5000
$Subdomain = "wranngle"
$KeyPath = "C:\Users\root\.ssh\id_rsa_serveo"

Write-Host "Starting persistent tunnel for https://$Subdomain.serveo.net..." -ForegroundColor Cyan

while ($true) {
    Write-Host "$(Get-Date): Connecting to Serveo..." -ForegroundColor Gray
    
    # Check if local server is even up first
    try {
        $response = Invoke-WebRequest -Uri "http://127.0.0.1:$LocalPort/api/health" -Method Get -ErrorAction SilentlyContinue
        if ($response.StatusCode -ne 200) {
            Write-Host "Warning: Local server on port $LocalPort does not seem to be responding." -ForegroundColor Yellow
        }
    } catch {
        Write-Host "Error: Local server on port $LocalPort is DOWN. Please start the app (bun run dev)." -ForegroundColor Red
    }

    # Start SSH and wait for it to exit
    ssh -i $KeyPath -o "StrictHostKeyChecking=no" -o "ServerAliveInterval=60" -o "ServerAliveCountMax=3" -R "$Subdomain:80:127.0.0.1:$LocalPort" serveo.net
    
    Write-Host "$(Get-Date): Tunnel disconnected. Restarting in 5 seconds..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
}

