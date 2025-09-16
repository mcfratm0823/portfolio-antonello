import shutil
import os

# Source directory
src_dir = "/Users/antonelloguarnieri/Desktop/sito web/Immagini lavori/lavori/gpf/"
# Destination directory
dst_dir = "/Users/antonelloguarnieri/Desktop/sito web/Prod3/progetti/gpf/img/"

# List of files to copy
files = ["gpf_blocco_uno.jpg", "gpf_blocco_due_uno.jpg", "gpf_blocco_due_due.jpg"]

# Copy each file
for file in files:
    src = os.path.join(src_dir, file)
    dst = os.path.join(dst_dir, file)
    try:
        shutil.copy2(src, dst)
        print(f"Successfully copied: {file}")
    except Exception as e:
        print(f"Error copying {file}: {e}")

# Verify the files were copied
print("\nFiles in destination directory:")
for file in os.listdir(dst_dir):
    print(f"  {file}")