$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Port = if ($env:PORT) { [int]$env:PORT } else { 8129 }
$Url = "http://127.0.0.1:$Port/softadmin-ai-poc.html"

Set-Location $Root

function Test-Command($Name) {
	$null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

Write-Host "Softadmin AI Mockup Demo"
Write-Host "Folder: $Root"

if (Test-Command "py") {
	Write-Host "Starting local server with Python launcher on $Url"
	Start-Process $Url
	py -3 -m http.server $Port --bind 127.0.0.1
	exit
}

if (Test-Command "python") {
	Write-Host "Starting local server with Python on $Url"
	Start-Process $Url
	python -m http.server $Port --bind 127.0.0.1
	exit
}

if (Test-Command "node") {
	Write-Host "Starting local server with Node on $Url"
	Start-Process $Url
	node server.js $Port
	exit
}

Write-Host "Python/Node was not found. Opening the HTML file directly."
Start-Process (Join-Path $Root "softadmin-ai-poc.html")

