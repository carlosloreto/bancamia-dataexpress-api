# Script de prueba con PowerShell
$uri = "https://bancamia-dataexpress-api-848620556467.southamerica-east1.run.app/api/v1/solicitudes"

$body = @{
    nombreCompleto = "Test Usuario PowerShell"
    tipoDocumento = "CC"
    numeroDocumento = "TEST$(Get-Date -Format 'yyyyMMddHHmmss')"
    fechaNacimiento = "1990-05-15"
    estadoCivil = "soltero"
    genero = "masculino"
    telefono = "3001234567"
    email = "testpowershell@email.com"
    direccion = "Calle 123"
    ciudad = "Bogota"
    departamento = "Cundinamarca"
    ocupacion = "Ingeniero"
    empresa = "Tech S.A.S"
    cargoActual = "Desarrollador"
    tipoContrato = "indefinido"
    ingresosMensuales = "5000000"
    tiempoEmpleo = "2a5"
    montoSolicitado = "20000000"
    plazoMeses = "36"
    proposito = "Compra de vehiculo"
    tieneDeudas = "no"
    refNombre1 = "Maria Lopez"
    refTelefono1 = "3009876543"
    refRelacion1 = "Hermana"
    refNombre2 = "Carlos Rodriguez"
    refTelefono2 = "3158765432"
    refRelacion2 = "Amigo"
} | ConvertTo-Json

Write-Host "Enviando POST a: $uri"
Write-Host "Body: $($body.Substring(0, [Math]::Min(100, $body.Length)))..."

$inicio = Get-Date

try {
    $response = Invoke-WebRequest -Uri $uri -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
    
    $tiempo = ((Get-Date) - $inicio).TotalMilliseconds
    $tiempoMs = [Math]::Round($tiempo)
    Write-Host "SUCCESS - Status: $($response.StatusCode) - Time: ${tiempoMs}ms" -ForegroundColor Green
    
    $data = $response.Content | ConvertFrom-Json
    Write-Host "ID: $($data.data.id)" -ForegroundColor Blue
    Write-Host "Nombre: $($data.data.nombreCompleto)" -ForegroundColor Blue
    Write-Host "Email: $($data.data.email)" -ForegroundColor Blue
    Write-Host "Monto: $($data.data.montoSolicitado)" -ForegroundColor Blue
} catch {
    $tiempo = ((Get-Date) - $inicio).TotalMilliseconds
    $tiempoMs = [Math]::Round($tiempo)
    Write-Host "ERROR after ${tiempoMs}ms" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Yellow
    }
}
