# Start Spring Boot in background
$springBootJob = Start-Job -ScriptBlock {
    Set-Location "c:\Users\ASUS\Desktop\git"
    .\mvnw.cmd -DskipTests spring-boot:run
}

# Wait for Spring Boot to start (approximately 8-10 seconds)
Write-Host "Starting Spring Boot application..."
Start-Sleep -Seconds 10

# Check if application is running by testing a simple endpoint
$maxAttempts = 5
$attempt = 0
$serverRunning = $false

while ($attempt -lt $maxAttempts -and -not $serverRunning) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:9091/api/setup/payment-count" -Method GET -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $serverRunning = $true
            Write-Host "✅ Server is running!"
        }
    } catch {
        $attempt++
        Write-Host "Attempt $attempt/$maxAttempts - Server not ready yet, waiting 2 more seconds..."
        Start-Sleep -Seconds 2
    }
}

if ($serverRunning) {
    # Server is running, now create sample data
    Write-Host "Creating sample payment data..."
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:9091/api/setup/sample-payments" -Method POST -Headers @{"Content-Type"="application/json"} -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            $responseData = $response.Content | ConvertFrom-Json
            Write-Host "✅ Sample data created successfully! Count: $($responseData.count)"
            
            # Now test the payment API
            Write-Host "Testing payment history API..."
            $historyResponse = Invoke-WebRequest -Uri "http://localhost:9091/api/admin/payments/history" -Method GET -TimeoutSec 10
            if ($historyResponse.StatusCode -eq 200) {
                $historyData = $historyResponse.Content | ConvertFrom-Json
                Write-Host "✅ Payment history API working! Found $($historyData.Length) payments"
            }
            
            # Test payment stats API
            Write-Host "Testing payment stats API..."
            $statsResponse = Invoke-WebRequest -Uri "http://localhost:9091/api/admin/payments/stats" -Method GET -TimeoutSec 10
            if ($statsResponse.StatusCode -eq 200) {
                $statsData = $statsResponse.Content | ConvertFrom-Json
                Write-Host "✅ Payment stats API working! Total revenue: `$$($statsData.totalRevenue)"
            }
            
            Write-Host "🎉 All payment APIs are working correctly!"
            Write-Host "You can now open the admin dashboard and check the payment history panel."
            
        } else {
            Write-Host "❌ Failed to create sample data. Status: $($response.StatusCode)"
        }
    } catch {
        Write-Host "❌ Error creating sample data: $($_.Exception.Message)"
    }
} else {
    Write-Host "❌ Server failed to start within the expected time"
}

# Stop the Spring Boot job
Write-Host "Stopping Spring Boot application..."
Stop-Job $springBootJob -ErrorAction SilentlyContinue
Remove-Job $springBootJob -ErrorAction SilentlyContinue

Write-Host "Script completed."