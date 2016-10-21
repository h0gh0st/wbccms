const express = require('express');
const router = express.Router();

const mongo = require('mongodb').MongoClient;
const assert = require('assert');
const mongourl = 'mongodb://localhost:27017/test';

mongo.connect(mongourl, (err, db) => {
  assert.equal(null, err);
  console.log('Connection Succesful');
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: req.app.locals.site.title,
    errors: req.flash('error')
  });
});

/* Login */
router.post('/login', (req, res, next) => {
  "use strict";
  let name = req.body.name;
  let pass = req.body.pass;
  let data = [];

  mongo.connect(mongourl, (err, db) => {
    assert.equal(null, err);
    let cursor = db.collection('userdata').find({}, {name: 1, pass: 1});
    cursor.forEach((dbitem, index, arr) => {
      assert.equal(null, index);
      if(dbitem.name === name && dbitem.pass === pass) {
        data.push(dbitem);
      }
    }, () => {
      db.close();
      if(data.length == 1) {
        let id = data[0]._id;

        //init session
        req.session.machineID = 2;
        // console.log('A', req.session.machineID);

        res.redirect('/users/' + id);
      }
      else {
        req.flash('error', 'Credential Failure');
        res.redirect('/');
      }
    });
  });
});

/* Register */
router.post('/register', function(req, res, next) {
  "use strict";
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
    status: 'active',
    notes: []
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
            res.redirect('/users/'+result.insertedId);
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
