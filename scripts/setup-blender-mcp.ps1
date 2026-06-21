# One-time Blender MCP setup helper for Windows.
# Run from project root: powershell -ExecutionPolicy Bypass -File scripts/setup-blender-mcp.ps1

$ErrorActionPreference = "Stop"
$uvBin = Join-Path $env:USERPROFILE ".local\bin"

Write-Host "=== Blender MCP setup ===" -ForegroundColor Cyan

if (-not (Get-Command blender -ErrorAction SilentlyContinue)) {
  Write-Host "Install Blender 4.x from https://www.blender.org/download/ then re-run this script." -ForegroundColor Yellow
} else {
  Write-Host "Blender found: $(Get-Command blender | Select-Object -ExpandProperty Source)"
}

if (-not (Test-Path (Join-Path $uvBin "uvx.exe"))) {
  Write-Host "Installing uv..."
  irm https://astral.sh/uv/install.ps1 | iex
  $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
  if ($userPath -notlike "*$uvBin*") {
    [Environment]::SetEnvironmentVariable("Path", "$userPath;$uvBin", "User")
    Write-Host "Added $uvBin to user PATH. Restart Cursor after setup." -ForegroundColor Yellow
  }
} else {
  Write-Host "uvx found at $uvBin\uvx.exe"
}

$addonDir = Join-Path $PSScriptRoot ".." "blender-mcp"
$addonFile = Join-Path $addonDir "addon.py"
New-Item -ItemType Directory -Force -Path $addonDir | Out-Null

if (-not (Test-Path $addonFile)) {
  Write-Host "Downloading blender-mcp addon.py..."
  Invoke-WebRequest -Uri "https://raw.githubusercontent.com/ahujasid/blender-mcp/main/addon.py" -OutFile $addonFile
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Green
Write-Host "1. Cursor MCP config is at .cursor/mcp.json (restart Cursor fully)"
Write-Host "2. Blender -> Edit -> Preferences -> Add-ons -> Install -> $addonFile"
Write-Host "3. Enable 'Interface: Blender MCP', open 3D View sidebar (N) -> Connect"
