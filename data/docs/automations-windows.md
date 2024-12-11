# Setting Up Yet Another Wiki as a Windows Service

## Prerequisites

* Windows system with PowerShell
* Administrator privileges
* Node.js and pnpm installed
* Next.js project deployed and built

## Service Configuration Scripts

### Create Service Script

Create a new file named `Create-YetAnotherWikiService.ps1`:

```shell
# Run this script as Administrator to create the service

$serviceName = "YetAnotherWikiService"
$serviceDisplayName = "Yet Another Wiki Service"
$serviceDescription = "Windows service to run Next.js server in the background"
$servicePath = "<path>"
$binaryPath = "C:\Windows\System32\cmd.exe /c cd /d $servicePath && pnpm next start"

# Check if the service already exists
$existingService = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
if ($existingService) {
    Write-Host "Service already exists. Removing it first..."
    sc.exe delete $serviceName
    Start-Sleep -Seconds 2
}

# Create the new service
$result = sc.exe create $serviceName binPath= $binaryPath start= auto DisplayName= $serviceDisplayName
if ($LASTEXITCODE -eq 0) {
    # Set the service description
    sc.exe description $serviceName $serviceDescription
    
    # Configure the service to restart on failure
    sc.exe failure $serviceName reset= 86400 actions= restart/60000/restart/60000/restart/60000
    
    Write-Host "Service created successfully!"
    Write-Host "You can now start the service using: Start-Service $serviceName"
} else {
    Write-Host "Failed to create service. Error code: $LASTEXITCODE"
}
```

### Remove Service Script

Create a new file named `Remove-YetAnotherWikiService.ps1`:

```shell
# Run this script as Administrator to remove the service

$serviceName = "YetAnotherWikiService"

# Stop the service if it's running
$service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
if ($service) {
    if ($service.Status -eq "Running") {
        Stop-Service $serviceName
        Write-Host "Service stopped."
        Start-Sleep -Seconds 2
    }
    
    # Delete the service
    sc.exe delete $serviceName
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Service removed successfully!"
    } else {
        Write-Host "Failed to remove service. Error code: $LASTEXITCODE"
    }
} else {
    Write-Host "Service does not exist."
}
```

## Installation Steps

1. Create both PowerShell scripts in your desired location
2. Replace `<path>` in the Create script with your Yet Another Wiki installation path
3. Open PowerShell as Administrator
4. Navigate to the directory containing the scripts

### Create the Service

```shell
.\Create-YetAnotherWikiService.ps1
```

:::info
You may need to adjust the ExecutionPolicy temporarily to run the script. ([More info here](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.security/set-executionpolicy?view=powershell-7.4 "More info here"))
:::

### Start the Service

```shell
Start-Service YetAnotherWikiService
```

## Service Management

### Basic Commands

```shell
# Check service status
Get-Service YetAnotherWikiService

# Stop service
Stop-Service YetAnotherWikiService

# Start service
Start-Service YetAnotherWikiService

# Restart service
Restart-Service YetAnotherWikiService
```

### Remove the Service

```shell
.\Remove-YetAnotherWikiService.ps1
```

## Troubleshooting

### Common Issues

1. **Service Won't Start**
   * Check Windows Event Viewer for errors
   * Verify path in service configuration
   * Ensure pnpm is in system PATH
   * Check project directory permissions
2. **Access Denied**
   * Ensure PowerShell is running as Administrator
   * Verify user account has necessary permissions
   * Check file system permissions on the project directory
3. **Port Conflicts**\`\`\`shell
   netstat -ano | findstr :3000```
   * Verify port 3000 is not in use
   * Check for other instances of the application
   ```

### Viewing Logs

Monitor service events in Windows Event Viewer:

1. Open Event Viewer
2. Navigate to Windows Logs > Application
3. Filter for Source: YetAnotherWikiService