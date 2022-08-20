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


exports.adduser = async ( req,res,next)=>{
    try{
        const shopid = req.body.shopid;
        const userid = req.body.userid;
        const time = req.body.time;
        result = await shop.findOne({_id:shopid});
        if(!result){
            res.json('no shop exist');
            console.log('no shop exist');
        }
        else{
            var mini = result.ShopCounter[0]*result.avgtime[0];
            var counter = 0 , i;
            let tt = 1;
            for(var j = 0 ; j< result.counter ; j++ ){
                if(result.ShopCounter[j]*result.avgtime[j]==0){
                    result.avgtime[j]++;
                    counter = j;
                    console.log(j);
                    tt = 0;
                }
            }
            await result.save();
            if(tt){
                for(i = 0; i < result.counter ; i++){
                    if(result.ShopCounter[i]*result.avgtime[i]<mini){
                        mini = result.ShopCounter[i]*result.avgtime[i];
                        counter = i;
                    }
                }
            }
            result.ShopCounter[counter]++;
            var pos =  result.ShopCounter[counter]
            ans = await users.findById(userid);
            if(!ans){
                console.log('no user exist')
                return res.json("no user exist");
            }
            result.queue.push({_id:userid,counter,time,pos});
            await result.save();
            res.json({counter:counter});
        }
    }
    catch(err){
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}
exports.removeuser = async (req,res,next)=>{
    try{
        const shopid = req.body.shopid;
        let userid = req.body.userid;
        const counter = req.body.counter-1;
        let time = req.body.time;
        result = await shop.findOne({_id:shopid});
        if(!result){
            res.json('no shop exist');
            console.log('no shop exist');
        }
        else{
            if(result.countertime[counter]==0){
                result.countertime[counter] = time;
                await result.save();
            }
            else{
                if(result.avgtime[counter]==0){
                    result.avgtime[counter] = time - result.countertime[counter];
                    await result.save();
                }else{
                    result.avgtime[counter] = (result.avgtime[counter] + (time - result.countertime[counter]))/2
                }
                result.countertime[counter] = time;
                await result.save();
            }
            // console.log(result.queue.length);
            if(result.queue.length){
                for(var i = 0; i < result.queue.length; i++){
                    if(result.queue[i].counter == counter){
                        if(userid==0){
                            userid = result.queue[i]._id
                        }
                        await shop.updateOne(
                            {_id:shopid},
                            {$pull:{
                                queue:{_id:userid}
                                }
                            },
                            {safe:true}
                            )
                        result.ShopCounter[counter]--;
                        await result.save();
                        break;
                    }
                }
            }
            res.status(201).json('user removed');
        }
    }
    catch(err){
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}