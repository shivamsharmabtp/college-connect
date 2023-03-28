var express = require('express');

var {authenticate} = require('./../middleware/authenticate');
var {Vote} = require('./../models/voteModel');

const fileName = __filename;

var notifySlack = require('../lib/slackNotifier');


var router = express.Router();
module.exports = router;

router.post('/cast', authenticate, (req, res) => {
    try {
    if(req.user){
        var body = req.body;
        var voteObj = {
            voter : req.user._id,
            voteType : body.voteType,
            timestamp : new Date().getTime(),
            itemId : body.itemId
        }

        Vote.findOne({voter : voteObj.voter, itemId : voteObj.itemId}, (err, doc) => {
            if(err){
                res.status(500).send(err);
            }else{
                if(doc){
                    if(doc.voteType == voteObj.voteType){
                        Vote.findOneAndDelete({voter : voteObj.voter, itemId : voteObj.itemId}, (err)=>{
                            if(err){
                                console.log("Error deleting vote");
                                console.log(err);
                                res.status(500).send('Error casting vote');
                            }else{
                                res.send('Vote removed')
                            }
                        })
                    }else{
                        Vote.findOneAndUpdate({voter : voteObj.voter, itemId : voteObj.itemId}, {voteType : voteObj.voteType}, (err, result)=>{
                            if(err){
                                console.log("Error casting vote");
                                console.log(err);
                                res.status(500).send('Error casting vote');
                            }else{
                                res.send('Vote casted')
                            }
                        })
                    }
                }else{
                    var vote = new Vote(voteObj);
                    vote.save((err) => {
                        if(err){
                            res.status(500).send('Error posting vote');
                            console.log(err);
                        }else{
                            res.send('Vote casted');
                        }
                    })
                }
            }
        })
        
    }else{
        res.status(401).send('Signin to cast vote')
    }
} catch (error) {
    console.log(error);
    res.status(500).send('Error proccesing request.');
  }
});

router.post('/count', (req, res) => {
    try {
    var body = req.body;
    Vote.find({itemId : body.itemId}, (err, docs) => {
        if(err){
            console.log(err);
            res.status(500).send('error counting votes');
        }else{
            var count = 0;
            docs.forEach(doc => {
                if(doc.voteType == 'up')
                    count++;
                else if(doc.voteType == 'down')
                    count--;
            })
            res.json(count);
        }
    });
} catch (error) {
    console.log(error);
    res.status(500).send('Error proccesing request.');
  }
})