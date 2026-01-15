# Remove all agent telemetry fetch calls for production readiness
# This script removes all fetch('http://127.0.0.1:7243/...') calls

Write-Host "🧹 Removing agent telemetry fetch calls..." -ForegroundColor Yellow

$removed = 0
$filesModified = 0

# Get all TypeScript/TSX files
$files = Get-ChildItem -Path . -Include *.ts,*.tsx -Recurse -File | Where-Object {
    $_.FullName -notlike "*\node_modules\*" -and
    $_.FullName -notlike "*\.next\*"
}

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    
    # Pattern 1: Remove entire fetch lines with 127.0.0.1:7243
    # This regex matches the full fetch call including the .catch()
    $pattern1 = '[\s]*fetch\([''"]http://127\.0\.0\.1:7243/[^)]+\}\)\}\)\.catch\(\(\)=>\{\}\);?[\r\n]*'
    $content = $content -replace $pattern1, ''
    
    # Pattern 2: Remove any remaining localhost:7243 references
    $pattern2 = '[\s]*fetch\([''"]http://localhost:7243/[^)]+\}\)\}\)\.catch\(\(\)=>\{\}\);?[\r\n]*'
    $content = $content -replace $pattern2, ''
    
    # Pattern 3: Remove #region agent log blocks with fetch
    $pattern3 = '[\s]*// #region agent log[\s\S]*?fetch\([''"]http://127\.0\.0\.1:7243[^\n]+\n[\s]*// #endregion[\r\n]*'
    $content = $content -replace $pattern3, ''
    
    # Pattern 4: Remove standalone agent log comments
    $pattern4 = '[\s]*// #region agent log[\s\S]*?// #endregion[\r\n]*'
    $matches = [regex]::Matches($content, $pattern4)
    foreach ($match in $matches) {
        if ($match.Value -match 'fetch.*127\.0\.0\.1') {
            $removed++
        }
    }
    $content = $content -replace $pattern4, ''
    
    if ($content -ne $originalContent) {
        # Count how many fetch calls were removed
        $fetchPattern = 'fetch\([''"]http://(127\.0\.0\.1|localhost):7243'
        $originalMatches = ([regex]::Matches($originalContent, $fetchPattern)).Count
        $newMatches = ([regex]::Matches($content, $fetchPattern)).Count
        $removedFromFile = $originalMatches - $newMatches
        
        $removed += $removedFromFile
        $filesModified++
        
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "  ✓ $($file.Name): Removed $removedFromFile fetch call(s)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Complete!" -ForegroundColor Green
Write-Host "   Files modified: $filesModified" -ForegroundColor Cyan
Write-Host "   Fetch calls removed: $removed" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "   1. Review changes with git diff" -ForegroundColor Gray
Write-Host "   2. Run npm run build" -ForegroundColor Gray
Write-Host "   3. Test critical flows" -ForegroundColor Gray
