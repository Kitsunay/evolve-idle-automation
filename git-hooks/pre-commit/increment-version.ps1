#!/usr/bin/env pwsh

# Check if version number has been manually updated
# If git diff returns a line with +/- that begins with "version", exit
$gitOutput = git diff --staged package.json
if ($null -eq $gitOutput) {
    $gitOutput = "" # Have at least an empty string to not break the script
}

$gitDiffLines = $gitOutput.Split([Environment]::NewLine)

for ($i = 0; $i -lt $gitDiffLines.Count; $i++) {
    # Discard file names
    if ($gitDiffLines[$i].StartsWith("---") -or $gitDiffLines[$i].StartsWith("+++")) {
        continue
    }

    # Get line with latest value
    if ($gitDiffLines[$i].StartsWith("+")) {
        # If a line matches regex that begins with "version", manual change has been made
        $regex = '^[+-]\s+"version":\s+"(\d+\.\d+\.\d+)"'
        if ($gitDiffLines[$i] -match $regex) {
            Write-Host "Manual change detected. Leaving version number [$($matches[1])] unchanged."
            exit 0
        }
    }
}

# Read current version number from package.json
$regex = '"version":\s*"(\d+\.\d+\.\d+)"'
$packageJson = Get-Content -Raw package.json # Raw makes the command return an actual string, instead of a stream object that breaks the regex matcher
if ($packageJson -match $regex) {
    $versionNumber = $matches[1]
}

# Increment patch version number
$versionNumberParts = $versionNumber.Split(".")
$versionNumberParts[2] = [int]$versionNumberParts[2] + 1
$versionNumber = $versionNumberParts -join "."

# Write new version number into package.json
$packageJson = $packageJson -replace $regex, """version"": ""$($versionNumber)"""
Set-Content package.json $packageJson

# Copy the same version number to manifest.json
$manifestJson = Get-Content -Raw manifest.json
$manifestJson = $manifestJson -replace $regex, """version"": ""$($versionNumber)"""
Set-Content manifest.json $manifestJson

# Stage changes to the upcoming commit
git add package.json manifest.json

Write-Host "Incremented version to [$($versionNumber)] in package.json and manifest.json"
exit 0