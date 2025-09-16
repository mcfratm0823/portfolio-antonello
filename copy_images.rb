require 'fileutils'

# Source directory
src_dir = "/Users/antonelloguarnieri/Desktop/sito web/Immagini lavori/lavori/gpf/"
# Destination directory
dst_dir = "/Users/antonelloguarnieri/Desktop/sito web/Prod3/progetti/gpf/img/"

# List of files to copy
files = ["gpf_blocco_uno.jpg", "gpf_blocco_due_uno.jpg", "gpf_blocco_due_due.jpg"]

# Copy each file
files.each do |file|
  src = File.join(src_dir, file)
  dst = File.join(dst_dir, file)
  begin
    FileUtils.cp(src, dst)
    puts "Successfully copied: #{file}"
  rescue => e
    puts "Error copying #{file}: #{e}"
  end
end

# Verify the files were copied
puts "\nFiles in destination directory:"
Dir.entries(dst_dir).each do |file|
  puts "  #{file}" unless file.start_with?('.')
end