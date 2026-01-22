# Simple HTTP Server for testing
# Run this script in PowerShell: .\start-server.ps1

$port = 8080
$path = $PSScriptRoot

Write-Host "Starting HTTP server at http://localhost:$port" -ForegroundColor Green
Write-Host "Serving files from: $path" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $localPath = $request.Url.LocalPath
        if ($localPath -eq "/") { $localPath = "/index.html" }

        $filePath = Join-Path $path $localPath.TrimStart("/")

        Write-Host "Request: $localPath" -ForegroundColor Gray

        if (Test-Path $filePath -PathType Leaf) {
            $content = [System.IO.File]::ReadAllBytes($filePath)

            # Set content type based on extension
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = switch ($ext) {
                ".html" { "text/html" }
                ".css"  { "text/css" }
                ".js"   { "application/javascript" }
                ".json" { "application/json" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                ".jpeg" { "image/jpeg" }
                ".gif"  { "image/gif" }
                ".svg"  { "image/svg+xml" }
                ".pdf"  { "application/pdf" }
                ".txt"  { "text/plain" }
                default { "application/octet-stream" }
            }

            $response.ContentType = $contentType
            $response.ContentLength64 = $content.Length
            $response.OutputStream.Write($content, 0, $content.Length)
        } else {
            $response.StatusCode = 404
            $errorBytes = [System.Text.Encoding]::UTF8.GetBytes("404 - File Not Found")
            $response.OutputStream.Write($errorBytes, 0, $errorBytes.Length)
        }

        try { $response.Close() } catch { }
    }
} finally {
    $listener.Stop()
}
