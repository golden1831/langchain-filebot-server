module.exports = app => {
    const pricingController = require("../controllers/pricingController");
    const { authToken } = require("../middleware/authToken");

    var router = require("express").Router();

    router.post("/subscription",pricingController.subscription);

    router.post('/webhook',pricingController.webhooks);


    

    router.get('/list', pricingController.findAll);

    router.post("/create", pricingController.create);

    router.put('/update/:id', pricingController.update);

    router.delete('/delete/:id', pricingController.delete)
    
    router.get('/:id', pricingController.findOne);
    
    app.use("/api/pricing", router);

};