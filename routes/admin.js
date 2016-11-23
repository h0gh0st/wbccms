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
    let dataTask = [];
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
                    let cursorMachine = db.collection('task').find({});
                    cursorMachine.forEach((dbitem, index, arr) => {
                        assert.equal(null, index);
                        dataTask.push(dbitem);
                    }, () => {
                        db.close();

                        res.render('admin.ejs', {
                            title: req.app.locals.site.title,
                            dataMachine: dataMachine,
                            dataUser: dataUser,
                            dataTickets: dataTickets,
                            dataTask: dataTask
                        });
                    });
                });
            });
        });
    });
});

router.get('/task', function(req, res, next) {
    "use strict";
    let dataTask = [];
    mongo.connect(mongourl, (err, db) => {
        assert.equal(null, err);
        let cursorMachine = db.collection('task').find({});
        cursorMachine.forEach((dbitem, index, arr) => {
            assert.equal(null, index);
            dataTask.push(dbitem);
    }, () => {
            db.close();
            res.json(dataTask);
        });
    });
});

router.post('/taskUpdate', function(req, res, next) {
    "use strict";
    let id = require('mongodb').ObjectID(req.body.id);
    let formData = req.body.formData;
    formData = formData.split('&');
    let taskStatus = formData[0];
    taskStatus = taskStatus.substr(taskStatus.indexOf("=") + 1);
    let taskProg = formData[1];
    taskProg = taskProg.substr(taskProg.indexOf("=") + 1);

    mongo.connect(mongourl, (err, db) => {
        assert.equal(null, err);
        db.collection('task').update({_id: id}, {
            $set: {
                status: taskStatus,
                taskProgress: taskProg
            }
        }, () => {
            db.close();
            res.send('Success');
        });
    });
});

router.post('/taskAdd', function(req, res, next) {
    "use strict";
    let formData = req.body.formData;
    formData = formData.split('&');
    let name = formData[0];
    name = name.substr(name.indexOf("=") + 1);
    let prog = formData[1];
    prog = prog.substr(prog.indexOf("=") + 1);

    mongo.connect(mongourl, (err, db) => {
        assert.equal(null, err);
        db.collection('task').insertOne({
            taskName: decodeURIComponent(name),
            status: 'Pending',
            taskProgress: prog
        });
        db.close();
        res.send('Success');
    });


});

module.exports = router;