
---
title: "Automating Daily Tasks with Python: A Beginner's Guide"
description: "Learn how to automate repetitive daily tasks using simple Python scripts to save time and reduce errors."
pubDate: 2023-10-30T10:00:00Z
slug: "automating-daily-tasks"
author: "Domdhi"
section: "automate"
tags: ["automation", "python", "productivity"]
image: "/images/python-automation.png"
---

## Automating the Mundane: Start with Daily Tasks

In this post, I'll walk through how I've automated some of my regular computer tasks using simple Python scripts. We'll cover basic file organization, automated backups, and data extraction from websites. Python is fantastic for this because it's readable and has a huge standard library, meaning you can do a lot without installing extra packages!

Let's dive into some common tasks that often eat up our time and see how Python can give us that time back.

### Cleaning Up Your Downloads Folder (File Organization)

Is your "Downloads" folder a chaotic mess of files? Mine used to be! We can write a simple script to move files based on their type (e.g., put PDFs in a 'Documents' folder, images in 'Pictures', etc.).

Python's built-in `os` and `shutil` modules are perfect for this.

```python
import os
import shutil

# Define the directory to organize
downloads_dir = "/path/to/your/Downloads" # <-- CHANGE THIS PATH
# Define target directories based on file types
target_dirs = {
    "Documents": [".pdf", ".docx", ".txt"],
    "Images": [".jpg", ".png", ".gif"],
    "Spreadsheets": [".xlsx", ".csv"],
    "Archives": [".zip", ".tar.gz"]
}

# Create target directories if they don't exist
for dir_name in target_dirs:
    path = os.path.join(downloads_dir, dir_name)
    if not os.path.exists(path):
        os.makedirs(path)
        print(f"Created directory: {path}")

# Iterate through files in the downloads directory
for filename in os.listdir(downloads_dir):
    file_path = os.path.join(downloads_dir, filename)

    # Skip if it's a directory itself
    if os.path.isdir(file_path):
        continue

    # Get the file extension
    file_extension = os.path.splitext(filename)[1].lower()

    # Check which target directory it belongs to
    moved = False
    for target_dir, extensions in target_dirs.items():
        if file_extension in extensions:
            destination_path = os.path.join(downloads_dir, target_dir, filename)
            try:
                shutil.move(file_path, destination_path)
                print(f"Moved '{filename}' to '{target_dir}'")
                moved = True
                break # Move to the next file
            except Exception as e:
                print(f"Error moving '{filename}': {e}")
                moved = True
                break # Stop trying for this file if there's an error

    # Optional: Handle files with extensions not in our list
    # if not moved:
    #     print(f"'{filename}' has an unhandled extension: {file_extension}")

print("\nDownloads folder organization complete!")
````

**How it works:**

1.  We import the `os` module (for interacting with the operating system, like listing files and checking paths) and `shutil` (for file operations like moving).
2.  We define the path to the folder you want to organize ( **Remember to change `/path/to/your/Downloads` to your actual path\!** ).
3.  We use a dictionary `target_dirs` to map folder names to lists of file extensions.
4.  The script checks if your target folders (like 'Documents', 'Images') exist inside the Downloads folder, and creates them if they don't.
5.  It loops through every item in the Downloads folder.
6.  For each item, it checks if it's a file (not a subfolder).
7.  It gets the file's extension and checks which list of extensions it belongs to in our `target_dirs` dictionary.
8.  If a match is found, it uses `shutil.move()` to move the file to the corresponding target folder.
9.  Error handling is included to catch potential issues during the move.

You can run this script whenever your Downloads folder gets messy\!

### Simple Automated Backups

Regular backups are essential, but easy to forget. A basic Python script can copy important files from one location to another (like an external drive or a cloud sync folder).

Again, `shutil` is your friend here for copying files or even entire folders.

```python
import shutil
import os
from datetime import datetime

# Define source and destination
source_dir = "/path/to/your/ImportantDocuments" # <-- CHANGE THIS PATH
backup_base_dir = "/path/to/your/BackupLocation" # <-- CHANGE THIS PATH

# Create a timestamp for the backup folder name
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
backup_target_dir = os.path.join(backup_base_dir, f"backup_{timestamp}")

try:
    # Check if source exists
    if not os.path.exists(source_dir):
        print(f"Error: Source directory not found at {source_dir}")
    else:
        # Create the timestamped backup directory
        os.makedirs(backup_target_dir, exist_ok=True) # exist_ok prevents error if it somehow exists
        print(f"Created backup directory: {backup_target_dir}")

        # Copy the entire directory
        shutil.copytree(source_dir, backup_target_dir)
        print(f"Successfully backed up '{source_dir}' to '{backup_target_dir}'")

except Exception as e:
    print(f"An error occurred during backup: {e}")

```

**How it works:**

1.  We import `shutil`, `os`, and `datetime` (to get the current date/time for a unique backup folder name).
2.  Define your `source_dir` (the folder you want to back up) and `backup_base_dir` (where you want the backups to go). **Change these paths\!**
3.  We create a unique name for the backup folder using the current date and time.
4.  The script checks if the source directory exists.
5.  It creates the new, timestamped backup directory within your backup location.
6.  `shutil.copytree()` is used to copy the entire contents of the source directory to the new backup directory.
7.  Basic error handling is included.

You could run this script manually, or schedule it to run automatically using your operating system's task scheduler (like Task Scheduler on Windows or cron on Linux/macOS).

### Basic Web Data Extraction (Web Scraping)

Sometimes you need to grab a bit of information from a website regularly – maybe a price, a news headline, or a specific status. Python's `requests` library makes it easy to fetch web pages. For beginners, we can often find the data we need just by looking for specific text or simple patterns in the HTML.

```python
import requests

# The URL of the page you want to get data from
url = "[https://example.com](https://example.com)" # <-- CHANGE THIS URL

try:
    # Send an HTTP GET request to the URL
    response = requests.get(url)

    # Raise an exception for bad status codes (404, 500, etc.)
    response.raise_for_status()

    # Get the HTML content of the page
    html_content = response.text

    print(f"Successfully fetched content from {url}")

    # --- Simple Example: Finding specific text ---
    # Let's say you want to check if the word "Python" is on the page
    search_term = "Python"
    if search_term in html_content:
        print(f"The word '{search_term}' was found on the page.")
    else:
        print(f"The word '{search_term}' was NOT found on the page.")

    # --- More Advanced (but still simple): Extracting data based on markers ---
    # This requires inspecting the website's source code to find unique markers
    # Example: If the data is always between <b>Data:</b> and <br>
    start_marker = "<b>Data:</b> "
    end_marker = "<br>"

    if start_marker in html_content and end_marker in html_content:
         # Find the start of the data
         start_index = html_content.find(start_marker) + len(start_marker)
         # Find the end of the data, starting the search AFTER the start_index
         end_index = html_content.find(end_marker, start_index)

         if end_index != -1: # Check if the end marker was found
             extracted_data = html_content[start_index:end_index].strip()
             print(f"Extracted data using markers: {extracted_data}")
         else:
             print("Could not find the end marker after the start marker.")
    else:
        print("Start or end marker not found on the page.")


except requests.exceptions.RequestException as e:
    print(f"Error fetching the page: {e}")
except Exception as e:
    print(f"An unexpected error occurred: {e}")
```

**How it works:**

1.  We import the `requests` library (you'll need to install this one: `pip install requests`).
2.  Define the `url` of the website you want to get data from. **Change this URL\!**
3.  `requests.get(url)` fetches the content of the page.
4.  `response.raise_for_status()` checks if the request was successful.
5.  `response.text` gives us the HTML content as a string.
6.  We then use basic Python string methods (`in`, `find`) to look for specific text or extract content located between specific markers in the HTML. **Note:** This simple method works for very basic cases. For complex websites, you'd need more robust libraries like BeautifulSoup or Scrapy.
7.  Error handling is included for issues fetching the page.

This script is a starting point. You'd need to view the source code of the website you're interested in to find the exact text or markers to look for.

### Wrapping Up

Automating daily tasks with Python scripts might take a little effort upfront to write the code, but the time and frustration they save in the long run are absolutely worth it. These simple examples using standard libraries are just the beginning of what you can do.

Think about your own repetitive tasks – is there something you do every day or week on your computer that a simple script could handle? Give it a try\! Start small, maybe with organizing files, and see how much easier your digital life becomes.

Happy automating\!
