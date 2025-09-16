on run
    set sourceFolder to POSIX file "/Users/antonelloguarnieri/Desktop/sito web/Immagini lavori/lavori/gpf/"
    set destFolder to POSIX file "/Users/antonelloguarnieri/Desktop/sito web/Prod3/progetti/gpf/img/"
    
    tell application "Finder"
        duplicate file "gpf_blocco_uno.jpg" of folder sourceFolder to folder destFolder
        duplicate file "gpf_blocco_due_uno.jpg" of folder sourceFolder to folder destFolder
        duplicate file "gpf_blocco_due_due.jpg" of folder sourceFolder to folder destFolder
    end tell
    
    return "Files copied successfully"
end run