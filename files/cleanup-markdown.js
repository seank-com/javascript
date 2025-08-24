/*jslint indent: 2, node: true, stupid: true */
/*global require: false, process: false, console: false */

// cleanup-markdown.js
//
// Consolidates markdown images from scattered media folders into a single
// attachments folder. Takes images from folder-name/media/imageX.ext and
// moves them to attachments/folder-name-X.ext, updating markdown references.
//
var path = require('path'),
  fs = require('fs'),
  argv = process.argv,
  argc = argv.length,
  processMarkdownFile = function (mdPath) {
    "use strict";

    var targetDir = path.dirname(mdPath),
      mdFile = path.basename(mdPath),
      baseName = path.basename(mdFile, '.md'),
      mediaDir = path.join(targetDir, baseName, 'media'),
      attachmentsDir = path.join(targetDir, 'attachments'),
      content = '',
      updatedContent = '',
      imageRegex = /!\[([^\]]*)\]\(([^)]+\/media\/[^)]+)\)/g,
      match = null,
      mediaFiles = [],
      i = 0,
      sourceImagePath = '',
      targetImagePath = '',
      newImageName = '',
      imageName = '';

    console.log('Processing: %s', mdFile);

    // Check if media directory exists
    if (!fs.existsSync(mediaDir)) {
      console.log('  No media directory found for %s', baseName);
      return;
    }

    // Create attachments directory if it doesn't exist
    if (!fs.existsSync(attachmentsDir)) {
      fs.mkdirSync(attachmentsDir);
      console.log('  Created attachments directory');
    }

    // Read markdown file
    try {
      content = fs.readFileSync(mdPath, 'utf8');
    } catch (err) {
      console.log('  Error reading %s: %s', mdFile, err.message);
      return;
    }

    // Get list of media files
    try {
      mediaFiles = fs.readdirSync(mediaDir);
    } catch (err) {
      console.log('  Error reading media directory for %s: %s', baseName, err.message);
      return;
    }

    // Process each media file
    for (i = 0; i < mediaFiles.length; i += 1) {

      imageName = mediaFiles[i];
        
      // Extract number from imageX.ext format
      if (imageName.match(/^image(\d+)\.(jpg|jpeg|png|gif|webp)$/i)) {
        sourceImagePath = path.join(mediaDir, imageName);
        newImageName = imageName.replace(/^image(\d+)\.(.+)$/i, baseName + '-$1.$2');
        // Convert .jpeg to .jpg
        newImageName = newImageName.replace(/\.jpeg$/i, '.jpg');
        targetImagePath = path.join(attachmentsDir, newImageName);

        // Move the image file
        try {
          fs.copyFileSync(sourceImagePath, targetImagePath);
          fs.unlinkSync(sourceImagePath);
          console.log('  Moved: %s -> attachments/%s', imageName, newImageName);
        } catch (err) {
          console.log('  Error moving %s: %s', imageName, err.message);
          continue;
        }
      }
    }

    // Update markdown content
    updatedContent = content.replace(imageRegex, function (fullMatch, altText, imagePath) {
      var pathParts = imagePath.split('/'),
        originalImageName = pathParts[pathParts.length - 1],
        newImageRef = '';

      if (originalImageName.match(/^image(\d+)\.(jpg|jpeg|png|gif|webp)$/i)) {
        newImageRef = originalImageName.replace(/^image(\d+)\.(.+)$/i, baseName + '-$1.$2');
        // Convert .jpeg to .jpg in references
        newImageRef = newImageRef.replace(/\.jpeg$/i, '.jpg');
        return '![' + altText + '](attachments/' + newImageRef + ')';
      }
      return fullMatch;
    });

    // Write updated markdown file
    if (updatedContent !== content) {
      try {
        fs.writeFileSync(mdPath, updatedContent, 'utf8');
        console.log('  Updated markdown references in %s', mdFile);
      } catch (err) {
        console.log('  Error updating %s: %s', mdFile, err.message);
        return;
      }
    }

    // Remove media directory if empty
    try {
      var remainingFiles = fs.readdirSync(mediaDir);
      if (remainingFiles.length === 0) {
        fs.rmdirSync(mediaDir);
        // Also remove parent directory if it only contained media
        var parentDir = path.join(targetDir, baseName);
        var parentFiles = fs.readdirSync(parentDir);
        if (parentFiles.length === 0) {
          fs.rmdirSync(parentDir);
          console.log('  Cleaned up empty directories');
        }
      }
    } catch (err) {
      console.log('  Warning: Could not clean up directories: %s', err.message);
    }
  },
  scanForMarkdownFiles = function (dir) {
    "use strict";

    var files = [],
      i = 0,
      file = '',
      filePath = '',
      stat = {};

    try {
      files = fs.readdirSync(dir);
    } catch (err) {
      console.log('Error reading directory %s: %s', dir, err.message);
      return;
    }

    for (i = 0; i < files.length; i += 1) {
      file = files[i];
      filePath = path.join(dir, file);

      try {
        stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && file !== 'attachments' && file !== 'media') {
          // Recursively process subdirectories
          scanForMarkdownFiles(filePath);
        } else if (stat.isFile() && file.toLowerCase().endsWith('.md')) {
          // Process markdown file
          processMarkdownFile(filePath);
        }
      } catch (err) {
        console.log('Error processing %s: %s', file, err.message);
      }
    }
  },
  main = function (argc, argv) {
    "use strict";

    var targetDirectory = '';

    if (argc !== 3) {
      console.log('usage: %s %s <target-directory>', argv[0], argv[1]);
      console.log('');
      console.log('Consolidates markdown images from scattered media folders into a single');
      console.log('attachments folder. Processes all .md files recursively.');
      console.log('');
      console.log('Example: node cleanup-markdown.js "c:\\Users\\seank\\Downloads\\Convert"');
    } else {
      targetDirectory = path.resolve(argv[2]);
      
      if (!fs.existsSync(targetDirectory)) {
        console.log('Error: Directory does not exist: %s', targetDirectory);
        return;
      }

      try {
        scanForMarkdownFiles(targetDirectory);
      } catch (err) {
        console.log('Error processing directory: %s', err.message);
      }
    }
  };

main(argc, argv);
