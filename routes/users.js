const express = require('express');
const router = express.Router();

const mongo = require('mongodb').MongoClient;
const assert = require('assert');
const mongourl = 'mongodb://localhost:27017/test';

//57f3637dcf76da1ff97d531f

/* GET users listing. */
router.get('/:machineNo/:userid', function(req, res, next) {
  "use strict";
  let data = [];
  let userid = req.params.userid;
  let machineNo = req.params.machineNo;
  console.log(machineNo);
  userid = require('mongodb').ObjectID(userid);

  mongo.connect(mongourl, (err, db) => {
    assert.equal(null, err);
    let cursor = db.collection('userdata').find({_id: userid});
    cursor.count((err, nbDocs) => {
      if(nbDocs === 0) {
        res.status(404).send('Not Found');
      }
      else {
        cursor.forEach((dbitem, index, arr) => {
          assert.equal(null, index);
          data.push(dbitem);
        }, () => {
          db.close();

          //capture session
          //console.log('B', req.session.machineID);

          res.render('userDash', {
            username : data[0].name,
            status: data[0].status,
            loginT: data[0].timelog[0].loginMsec,
            title: req.app.locals.site.title,
            machineID: req.session.machineID,
            rate: req.app.locals.site.rate
          });
        });
      }
    });
  });
});

router.post('/pay', function(req, res, next) {
  "use strict";
  let duration = req.body.finalT;
  let price = req.body.finalP;

  console.log(duration +" "+ price);
});

module.exports = router;
