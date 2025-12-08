# Test del endpoint de solicitudes
$body = @{
    email = "test.$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"
    autorizacionTratamientoDatos = $true
    autorizacionContacto = $true
    nombreCompleto = "Test Usuario Completo"
    tipoDocumento = "CC"
    numeroDocumento = "999$(Get-Date -Format 'HHmmss')"
    fechaNacimiento = "1990-01-15"
    fechaExpedicionDocumento = "2020-01-15"
    ciudadNegocio = "201"
    direccionNegocio = "Calle Test 123 #45-67"
    celularNegocio = "3001234567"
} | ConvertTo-Json

Write-Host "📤 Enviando solicitud a la API..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/solicitudes" -Method POST -ContentType "application/json" -Body $body -TimeoutSec 60
    
    Write-Host "`n✅ Solicitud creada exitosamente!" -ForegroundColor Green
    Write-Host "`n📋 Datos de la solicitud:"
    Write-Host "   ID: $($response.data.id)"
    Write-Host "   Email: $($response.data.email)"
    Write-Host "   Nombre: $($response.data.nombreCompleto)"
    
    Write-Host "`n📄 Información del PDF:"
    if ($response.data.documento) {
        Write-Host "   ✅ Campo 'documento' existe" -ForegroundColor Green
        Write-Host "   URL: $($response.data.documento.url)"
        Write-Host "   Path: $($response.data.documento.path)"
        Write-Host "   FileName: $($response.data.documento.fileName)"
        Write-Host "`n🔗 Puedes abrir la URL en tu navegador para ver el PDF" -ForegroundColor Yellow
    } else {
        Write-Host "   ❌ Campo 'documento' NO existe" -ForegroundColor Red
    }
} catch {
    Write-Host "`n❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody"
    }
}


