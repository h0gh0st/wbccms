const express = require('express');
const router = express.Router();

const mongo = require('mongodb').MongoClient;
const assert = require('assert');
const mongourl = 'mongodb://localhost:27017/test';

/* GET users listing. */
router.get('/:machineNo/:userid', function(req, res, next) {
  "use strict";
  let data = [];
  let userid = req.params.userid;
  let machineNo = req.params.machineNo;
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
          let lastE = data[0].timelog.length - 1;
          db.close();

          res.render('userDash', {
            username : data[0].name,
            status: data[0].status,
            loginT: data[0].timelog[lastE].loginMsec,
            rate: req.app.locals.site.rate,
            title: req.app.locals.site.title,
            machineNo: machineNo,
            userId: userid
          });
        });
      }
    });
  });
});

router.post('/pay/:machineNo/:userid', function(req, res, next) {
  "use strict";
  let data = [];
  let userid = req.params.userid;
  userid = require('mongodb').ObjectID(req.params.userid);
  let machineNo = req.params.machineNo;

  let duration = req.body.finalT;
  let price = req.body.finalP;
  let payOpt = req.body.finalOpt;

  let dt = new Date();
  let d = dt.getFullYear() +'-'+ (dt.getMonth()+1) +'-'+ dt.getDate();
  let t = dt.getHours() +':'+ dt.getMinutes() +':'+ dt.getSeconds()+ '.' +dt.getMilliseconds();
  let msec = dt.getTime();

  mongo.connect(mongourl, (err, db) => {
    assert.equal(null, err);
    let cursor = db.collection('userdata').find({_id: userid});
    cursor.forEach((dbitem, index, arr) => {
      assert.equal(null, index);
      data.push(dbitem);
    }, () => {
      let lastE = data[0].timelog.length - 1;
      data[0].timelog[lastE].logout = t;
      data[0].timelog[lastE].logoutMsec = msec;
      data[0].timelog[lastE].price = price;
      data[0].status = 'closed';

      db.collection('userdata').update({_id: userid}, {
        $set: {
          timelog: data[0].timelog,
          status: 'inactive'
        }
      });

      db.close();
      res.redirect('/index/');
    });
  });
});

module.exports = router;
