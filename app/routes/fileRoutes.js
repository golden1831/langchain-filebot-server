module.exports = app => {    
    const fileController = require('../controllers/fileController');
    const { authToken } = require("../middleware/authToken");

    var router = require("express").Router();    

    const multer = require('multer');
    const path = require('path');

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'public/chatbot_file_upload')
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + path.extname(file.originalname))
        }
    });
    
    var upload = multer({storage: storage});

    router.post('/upload/:id', upload.array('embedFile', 3), fileController.create);

    router.post('/delete', fileController.delete);

    app.use("/api/embed_file", router);
};  