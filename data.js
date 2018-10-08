var fs = require('fs');
var path = require('path');
var os = require("os");

var textDirectory = __dirname + '/text/';

var allData = {};

fs.readdir(textDirectory, function(err, files) {
    files.forEach(function(file, index) {
      var textFilePath = path.join( textDirectory, file );
      var text = getText(textFilePath);
      var lines = getLines(text);
      if (hasCopyrightLine(text)) {
        var pages = splitDocumentAfterCopyright(lines);
        for (var pageNo in pages) {
            if (hasKeywords(pages[pageNo])) {
                var warscrolls = splitLinesAfterWord(pages[pageNo], "KEYWORDS");
                for(var w in warscrolls) {
                    if (warscrolls[w].length > 1) {
                        var warscroll = handleSplitText(warscrolls[w]);
                        allData[getNameKey(warscroll.name)] = warscroll;
                    }
                }
            }
        }
        return;
      }
      var firstLine = getLine(0, lines);
      var warscroll = false;
        if (firstLine.trim() == "ocr") {
            lines = getLinesOCR(textFilePath);
            warscroll = handleOCR(lines);
            if (warscroll.name.length == 0  || warscroll.name == "WARSCROLL") {
                warscroll.name = removeFromEnd(
                    removeFromEnd(file, ".txt")
                        .replace("warhammer-aos-", ""),
                    "-en");
            }
        } else {
            warscroll = handlePDF(lines);
        }
        if (warscroll != false) {
            allData[getNameKey(warscroll.name)] = warscroll;
        }
    });

    fs.writeFile("output.json", JSON.stringify(allData), function(err) {
          if(err) {
              return console.log(err);
          }
          console.log("Output saved");
      });
    console.log(allData);
});

function getNameKey(name)
{
    return name.toLowerCase().replace(/[^a-zA-Z0-9]+/g, "-");
}

function handleOCR(lines) {
    var data = {};
    data.name = getName(lines);
    data.keywords = getKeywords(lines);
    return data;
}

function getName(lines) {
        return getLine(1, lines).replace(/[^A-Za-z ]/g, '').trim();
}

function getKeywords(lines)
{
    var result = [];
    var keywordLines = findLinesWithWord("KEYWORDS", lines);
    if (keywordLines.length > 0) {
        for(var lineNo in keywordLines) {
            var keywordLine = getLinePart(keywordLines[lineNo], "KEYWORDS", true);
            result = keywordLine.replace(/[^A-Z ,]/g, '').trim().split(", ");
        }
    }
    return result;
}

function handleSplitText(lines) {
    var data = {};
    data.name = getLine(0, lines).trim();
    data.keywords = getKeywords(lines);
    return data;
}

function handlePDF(lines) {
    var data = {};
    data.name = getLine(1, lines).trim();
    data.keywords = getKeywords(lines);
    return data;
}

function getLine(line_no, lines) {
    if (line_no < 0) {
        line_no = lines.length + line_no;
    }
    if(+line_no > lines.length){
      throw new Error('File end reached without finding line');
    }
    return lines[+line_no];
}

function getText(filename)
{
    var data = fs.readFileSync(filename, 'utf8');
    return data;
}

function getLines(text) {
    var lines = text.trim().split("\n");
    return lines;
}

function getLinesOCR(filename) {
    var data = fs.readFileSync(filename, 'utf8');
    var lines = data.trim().split(os.EOL)[1].split("\n\n");
    return lines;
}

function findLinesWithWord(word, lines) {
    //Finds a line that contains a word, case sensitive
    var matchingLines = [];
    for (var lineNo in lines) {
        if(lines[lineNo].indexOf(word) >= 0) {
            matchingLines.push(lines[lineNo]);
        }
    }
    return matchingLines;
}

function getLinePart(line, startsWith, excludeStartTag) {
    var pos = line.indexOf(startsWith);
    var part = line.substr(pos + ((excludeStartTag) ? startsWith.length : 0));
    return part;
}

function endsWith(subject, search) {
    var pos = subject.lastIndexOf(search);
    var endPos = subject.length - search.length;
    if (endPos == pos) {
        return true;
    }
    return false;
}

function removeFromEnd(subject, search) {
    if (endsWith(subject, search)) {
        var pos = subject.lastIndexOf(search);
        return subject.substr(0, pos);
    }
    return subject;
}

function hasCopyrightLine(text)
{
    var copyright = "Warhammer Age of Sigmar © Games Workshop Ltd.";
    return text.indexOf(copyright) >= 0;
}

function hasKeywords(lines) {
     for (var lineNo in lines) {
        if(lines[lineNo].indexOf("KEYWORDS") >= 0) {
            return true;
        }
     }
     return false;
}

function splitDocumentAfterCopyright(lines) {
     //Finds a line that contains a word and uses it as a delimeter for the end of documents
    var copyright = "Warhammer Age of Sigmar © Games Workshop Ltd.";
    var splitDocuments = splitLinesAfterWord(lines, copyright);
    return splitDocuments;
}

function splitLinesAfterWord(lines, word)
{
    var splitDocuments = [];
    var documentNumber = 0;
    for (var lineNo in lines) {
        if (!splitDocuments[documentNumber]) {
            splitDocuments[documentNumber] = [];
        }
        splitDocuments[documentNumber].push(lines[lineNo]);
        //word line
        if(lines[lineNo].indexOf(word) >= 0) {
            documentNumber++;
        }
    }
    return splitDocuments;
}
