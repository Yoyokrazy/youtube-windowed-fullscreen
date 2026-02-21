# Bump the patch version in manifest.json and report the new version.
# Minor and major bumps are handled exclusively by the GitHub Actions release workflow.
# Usage:
#   .\build.ps1          # bump patch  (1.0.0 -> 1.0.1)

$manifestPath = Join-Path $PSScriptRoot "manifest.json"
$manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json

$parts = $manifest.version -split '\.'
$major = [int]$parts[0]
$minor = [int]$parts[1]
$patch = [int]$parts[2]

$patch++

$newVersion = "$major.$minor.$patch"
$manifest.version = $newVersion
$json = $manifest | ConvertTo-Json -Depth 10
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($manifestPath, $json, $utf8NoBom)

Write-Host "Build complete: v$newVersion"
