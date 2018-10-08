var tesseract = require('node-tesseract');

tesseract.process(__dirname + '/images/aos-warscroll-prostecutorhammers-en.jpg', {'config': 'hocr'}, function(err, text) {
    if(err) {
        console.error(err);
    } else {
        console.log(text);
    }
});