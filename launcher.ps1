$port = 5050
$distPath = Join-Path $PSScriptRoot "dist"

if (-not (Test-Path $distPath)) {
    Write-Host "Không tìm thấy thư mục 'dist'! Đang chạy build tự động..." -ForegroundColor Yellow
    npm run build
}

$hasPython = (Get-Command python -ErrorAction SilentlyContinue) -ne $null

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "   🌲 KHỞI ĐỘNG WILDWOOD TCG - GAME THẺ BÀI CHIẾN THUẬT   " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "Trò chơi đang chạy tại: http://localhost:$port/" -ForegroundColor Yellow
Write-Host "Đang tự động mở trình duyệt web mặc định của bạn..." -ForegroundColor Gray
Write-Host "Giữ cửa sổ này trong khi chơi. Đóng cửa sổ để thoát game." -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Green

# Launch default browser
Start-Process "http://localhost:$port/"

if ($hasPython) {
    Set-Location $distPath
    python -m http.server $port
} else {
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:$port/")
    $listener.Start()

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $localPath = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrEmpty($localPath) -or $localPath -eq '/') {
            $localPath = "index.html"
        }

        $filePath = Join-Path $distPath $localPath

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".json" { "application/json" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                ".svg"  { "image/svg+xml" }
                ".ico"  { "image/x-icon" }
                default { "application/octet-stream" }
            }
            $response.ContentType = $mime
            $buffer = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        } else {
            $response.StatusCode = 404
            $buffer = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        }
        $response.Close()
    }
}
