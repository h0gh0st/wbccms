const express = require('express');
const router = express.Router();

const mongo = require('mongodb').MongoClient;
const assert = require('assert');
const mongourl = 'mongodb://localhost:27017/test';

router.get('/', function(req, res, next) {
    "use strict";
    let dataMachine = [];
    let dataUser = [];
    let dataTickets = [];
    mongo.connect(mongourl, (err, db) => {
        assert.equal(null, err);
        let cursorMachine = db.collection('machinelist').find({});
        cursorMachine.forEach((dbitem, index, arr) => {
            assert.equal(null, index);
            dataMachine.push(dbitem);
        }, () => {
            let cursorUser = db.collection('userdata').find({});
            cursorUser.forEach((dbitem, index, arr) => {
                assert.equal(null, index);
                dataUser.push(dbitem);
            }, () => {
                let cursorUser = db.collection('tickets').find({});
                cursorUser.forEach((dbitem, index, arr) => {
                    assert.equal(null, index);
                    dataTickets.push(dbitem);
                }, () => {
                    db.close();

                    res.render('admin.ejs', {
                        title: req.app.locals.site.title,
                        dataMachine: dataMachine,
                        dataUser: dataUser,
                        dataTickets: dataTickets
                    });
                });
            });
        });
    });
});



/*router.get('/new', function(req, res, next) {
    "use strict";
    let machineBox = [];
    let userBox = [];
    const fs = require('fs');


});*/

module.exports = router;