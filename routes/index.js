const express = require('express');
const router = express.Router();

const mongo = require('mongodb').MongoClient;
const assert = require('assert');
const mongourl = 'mongodb://localhost:27017/wbccms';

mongo.connect(mongourl, (err, db) => {
  assert.equal(null, err);
  console.log('Connection Succesful');
});


/* GET home page. */
router.get('/', function(req, res, next) {
  "use strict";
  let openmachine = [];

  mongo.connect(mongourl, (err, db) => {
    assert.equal(null, err);
    let cursor = db.collection('machinelist').find({});
    cursor.forEach((dbitem, index, arr) => {
      assert.equal(null, index);
      if(dbitem.status === 'open') {
        openmachine.push(dbitem);
      }
    }, () => {
      db.close();
      res.render('index', {
        title: req.app.locals.site.title,
        errors: req.flash('error'),
        openmachine: openmachine
      });
    })
  });
});

/* Login */
router.post('/login', (req, res, next) => {
  "use strict";
  let name = req.body.name;
  let pass = req.body.pass;
  let machineNo = req.body.machineNo;
  machineNo = require('mongodb').ObjectID(machineNo);
  let data = [];

  mongo.connect(mongourl, (err, db) => {
    assert.equal(null, err);
    let cursor = db.collection('userdata').find({}, {name: 1, pass: 1, status: 1});
    cursor.forEach((dbitem, index, arr) => {
      assert.equal(null, index);
      if(dbitem.name === name && dbitem.pass === pass) {
        data.push(dbitem);
      }
    }, () => {

      if(data.length == 1) {
        let id = data[0]._id;
        id = require('mongodb').ObjectID(id);
        let status = data[0].status;

        let dt = new Date();
        let d = dt.getFullYear() +'-'+ (dt.getMonth()+1) +'-'+ dt.getDate();
        let t = dt.getHours() +':'+ dt.getMinutes() +':'+ dt.getSeconds()+ '.' +dt.getMilliseconds();
        let msec = dt.getTime();

          if (status == 'active') {
            db.close();
            req.flash('error', 'User Already Active');
            res.redirect('/');
          }
          else {
            db.collection('machinelist').update({_id: machineNo}, {
              $set: {
                status: 'active',
                currentUser: data[0].name
              }
            });

            db.collection('userdata').update({_id:id}, {
              $push : { timelog : {
                date: d,
                login: t,
                loginMsec: msec,
                logout: null,
                logoutMsec: null,
                price: null
              }},
              $set : { status: 'active' }
            });

            db.close();
            res.redirect('/users/'+machineNo+'/'+id);
          }
      }
      else {
        db.close();
        req.flash('error', 'Credential Failure');
        res.redirect('/');
      }
    });
  });
});

/* Register */
router.post('/register', function(req, res, next) {
  "use strict";
  let machineNo = req.body.machineNo;
  let checkName;
  let dt = new Date();
  let d = dt.getFullYear() +'-'+ (dt.getMonth()+1) +'-'+ dt.getDate();
  let t = dt.getHours() +':'+ dt.getMinutes() +':'+ dt.getSeconds()+ '.' +dt.getMilliseconds();
  let msec = dt.getTime();
  let name = req.body.name;
  let pass = req.body.pass;
  let email = req.body.email;

  let item = {
    name: name,
    email: email,
    pass: pass,
    timelog: [{
      date: d,
      login: t,
      loginMsec: msec,
      logout: null,
      logoutMsec: null,
      price: null
    }],
    emotion: [{
      date: null,
      time: null,
      reading: null
    }],
    status: 'active'
  };

  mongo.connect(mongourl, (err, db) => {
    assert.equal(null, err);
    let cursor = db.collection('userdata').find({}, {name:1});
    cursor.forEach((dbitem, index, arr) => {
      assert.equal(null, index);
      if(dbitem.name === name) {
        checkName = true;
      }
    }, () => {
      if (checkName === true) {
        db.close();
        req.flash('error', 'User Name Already Taken');
        res.redirect('/');
      }
      else {
        try {
          db.collection('userdata').insertOne(item, function(err, result) {
            assert.equal(null, err);
            console.log('User ' +item.name+ ' created');
            res.redirect('/users/'+machineNo+'/'+result.insertedId);
          });
        }
        catch (e) {
          console.log('Error inserting data!');
        }
      }
    });
  });
});

module.exports = router;
