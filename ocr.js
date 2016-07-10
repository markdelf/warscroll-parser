var tesseract = require('node-tesseract');

tesseract.process(__dirname + '/test-1.jpg',function(err, text) {
    if(err) {
        console.error(err);
    } else {
        console.log(text);
    }
});