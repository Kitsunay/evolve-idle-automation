#!/usr/bin/env powershell
# Run all post-commit scripts from script folder

$fileItems = Get-ChildItem ./git-hooks/post-commit

for ($i = 0; $i -lt $fileItems.Count; $i++) {
    $fileItem = $fileItems[$i]
    
    # We do not want to run directories, only files
    if (Test-Path -Path $fileItem.FullName -PathType Container) {
        continue
    }

    # Run the script
    $fileItem.FullName
    powershell $fileItem.FullName
}

# If any script produced commits, squash them to one commit with original message

exit 0