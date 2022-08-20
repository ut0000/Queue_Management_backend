const stores = require("../models/stores");
const shop = require("../models/shops");
var mongoose = require('mongoose');
exports.makestore = async (req,res,next)=>{
    try{
        mongoose.Types.ObjectId.isValid(req.params.id);
        const result = await stores.findById(req.params.id)
        console.log(result);
        if(!result){
            res.json('User not Found');
            res.status = 404;
        }
        else{
            const name = req.body.name;
            const Address = req.body.Address;
            const long = req.body.long;                                 
            const latti = req.body.latti;
            const counter = req.body.counter;
            const ShopCounter = req.body.ShopCounter;
            const countertime = req.body.countertime;
            const avgtime = req.body.avgtime;
            const queueassign = req.body.queueassign;
            const opentime = req.body.opentime;
            const closetime = req.body.closetime;
            newshop = new shop({
                name:name,
                Address:Address,
                long:long,
                latti:latti,
                counter:counter,
                ShopCounter:ShopCounter,
                countertime:countertime,
                avgtime:avgtime,
                queueassign:queueassign,
                opentime:opentime,
                closetime:closetime
            })
            await newshop.save();
            result.shopid = newshop._id;
            await result.save();
            res.json(newshop);
        }
    }
    catch(err){
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}