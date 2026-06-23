$files = Get-ChildItem -Path "C:\Users\LENOVO\.gemini\antigravity\scratch\digital-heroes\src\app" -Recurse -Include *.tsx, *.ts
foreach ($file in $files) {
    if ($file.FullName -like "*\page.tsx.backup") { continue }
    $content = Get-Content $file.FullName -Raw
    if ($content -match "indigo" -or $content -match "cyan") {
        $newContent = $content -replace "indigo", "emerald" -replace "cyan", "teal"
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        Write-Host "Updated: $($file.FullName)"
    }
}
