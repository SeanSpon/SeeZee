# Remove all agent telemetry fetch calls
Write-Host "Removing agent telemetry fetch calls..." -ForegroundColor Yellow

$removed = 0
$filesModified = 0

$files = Get-ChildItem -Path . -Include *.ts,*.tsx -Recurse -File | Where-Object {
    $_.FullName -notlike "*\node_modules\*" -and $_.FullName -notlike "*\.next\*"
}

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    
    # Remove fetch lines
    $pattern = '[\s]*fetch\([''"]http://(127\.0\.0\.1|localhost):7243/[^)]+\}\)\}\)\.catch\(\(\)=>\{\}\);?[\r\n]*'
    $content = $content -replace $pattern, ''
    
    # Remove #region agent log blocks
    $pattern2 = '[\s]*// #region agent log[\s\S]*?// #endregion[\r\n]*'
    $content = $content -replace $pattern2, ''
    
    if ($content -ne $originalContent) {
        $fetchPattern = 'fetch\([''"]http://(127\.0\.0\.1|localhost):7243'
        $originalMatches = ([regex]::Matches($originalContent, $fetchPattern)).Count
        $newMatches = ([regex]::Matches($content, $fetchPattern)).Count
        $removedFromFile = $originalMatches - $newMatches
        
        $removed += $removedFromFile
        $filesModified++
        
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "  OK $($file.Name): Removed $removedFromFile calls" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Done! Files modified: $filesModified, Fetch calls removed: $removed" -ForegroundColor Green
