module.exports = app => {    
    const userController = require('../controllers/userController');
    const { authToken, adminToken } = require("../middleware/authToken");

    var router = require("express").Router();    
    
    router.get('/list', [adminToken], userController.findAll);

    router.post('/create', [adminToken], userController.create_by_admin);

    router.put('/update/:id', [adminToken], userController.update_by_admin);

    router.delete('/delete/:id',[adminToken], userController.delete_by_admin);

    
    router.put('/profile/:id', [authToken], userController.update_by_user);
    
    router.get('/:id', [authToken], userController.findOne);

    app.use("/api/user", router);
};