# Bump the patch version in manifest.json and report the new version.
# Usage:
#   .\build.ps1          # bump patch  (1.0.0 -> 1.0.1)
#   .\build.ps1 minor    # bump minor  (1.0.3 -> 1.1.0)
#   .\build.ps1 major    # bump major  (1.2.3 -> 2.0.0)

param(
    [ValidateSet("patch", "minor", "major")]
    [string]$Bump = "patch"
)

$manifestPath = Join-Path $PSScriptRoot "manifest.json"
$manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json

$parts = $manifest.version -split '\.'
$major = [int]$parts[0]
$minor = [int]$parts[1]
$patch = [int]$parts[2]

switch ($Bump) {
    "major" { $major++; $minor = 0; $patch = 0 }
    "minor" { $minor++; $patch = 0 }
    "patch" { $patch++ }
}

$newVersion = "$major.$minor.$patch"
$manifest.version = $newVersion
$manifest | ConvertTo-Json -Depth 10 | Set-Content $manifestPath -Encoding UTF8

Write-Host "Build complete: v$newVersion"
