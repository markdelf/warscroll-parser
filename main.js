var fs = require('fs');
var path = require('path');
var gs = require('ghostscript');
var tesseract = require('node-tesseract');
var os = require("os");

var pdfDirectory = __dirname + '/pdf/';

fs.readdir(pdfDirectory, function(err, files) {
    files.forEach(function(file, index) {
      var pdfFilePath = path.join( pdfDirectory, file );
      extractTextFromPdf(pdfFilePath, function(textFilePath) {
        var fileSize = getFilesizeInBytes(textFilePath);
        if (fileSize == 0) {
          convertPdf(pdfFilePath, function(imageFilePath) {
            extractTextFromImage(imageFilePath, function(text) {
                fs.writeFile(textFilePath + ".html", text, function(err) {
                  if(err) {
                      return console.log(err);
                  }
                  console.log(file + " parsed");
              });
            });
          });
        } else {
          console.log(file + " parsed");
        }
      });
    });
});

function convertPdf(pdfFilePath, onSuccess) {
    var fileName = path.basename(pdfFilePath);
    var imageFilename = fileName.replace(".pdf", ".jpg");
    var imageFilePath = __dirname + '/images/' + imageFilename;

    gs()
        .batch()
        .quiet()
        .nopause()
        .device('jpeg')
        .input(pdfFilePath)
        .output(imageFilePath)
        .r(300)
        .jpegq(100)
        .exec(function(err, stdout, stderr) {
            if (!err) {
                onSuccess(imageFilePath);
            } else {
                console.log(err);
            }
        });
}

function extractTextFromImage(imageFilePath, onSuccess) {
    tesseract.process(imageFilePath, {'config': 'hocr'}, function(err, text) {
        if (!err) {
            onSuccess(text);
        } else {
            console.error(err);
        }
    });
}

function extractTextFromPdf(pdfFilePath, onSuccess) {
    var fileName = path.basename(pdfFilePath);
    var txtFilename = fileName.replace(".pdf", ".txt");
    var txtFilePath = __dirname + '/text/' + txtFilename;

    gs()
        .batch()
        .quiet()
        .nopause()
        .device('txtwrite')
        .input(pdfFilePath)
        .output(txtFilePath)
        .exec(function(err, stdout, stderr) {
            if (!err) {
                onSuccess(txtFilePath);
            } else {
                console.log(err);
            }
        });
}

function getFilesizeInBytes(filename) {
 var stats = fs.statSync(filename)
 var fileSizeInBytes = stats["size"]
 return fileSizeInBytes
}