const express = require('express');
const router = express.Router();

const mongo = require('mongodb').MongoClient;
const assert = require('assert');
const mongourl = 'mongodb://localhost:27017/wbccms';

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
                            rate: req.app.locals.site.rate,
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

router.get('/rate', function(req, res, next) {
    "use strict";
    let rate = req.app.locals.site.rate;
    res.json(rate);
});

router.post('/rateChange', function(req, res, next) {
    "use strict";
    let newrate = req.body.newrate;
    newrate = newrate.split('&');
    let rate = newrate[0];
    rate = rate.substr(rate.indexOf("=") + 1);
    rate = parseFloat(Math.round(rate * 100) / 100).toFixed(2);
    console.log('Server Rate', rate);
    res.app.locals.site.rate = parseFloat(rate);
    res.send('Success');
});

router.get('/machine', function(req, res, next) {
    "use strict";
    let dataMachine = [];
    mongo.connect(mongourl, (err, db) => {
        assert.equal(null, err);
        let cursorMachine = db.collection('machinelist').find({});
        cursorMachine.forEach((dbitem, index, arr) => {
            assert.equal(null, index);
            dataMachine.push(dbitem);
        }, () => {
            db.close();
            res.json(dataMachine);
        });
    });
});

router.post('/machineUpdate/', function(req, res, next) {
    "use strict";
    let id = require('mongodb').ObjectID(req.body.id);
    let toStatus = req.body.toStatus;

    mongo.connect(mongourl, (err, db) => {
        assert.equal(null, err);
        db.collection('machinelist').update({_id: id}, {
            $set: {
                status: toStatus,
            }
        }, () => {
            db.close();
            res.send('Success');
        });
    });
});

router.get('/task', function(req, res, next) {
    "use strict";
    let dataTask = [];
    mongo.connect(mongourl, (err, db) => {
        assert.equal(null, err);
        let cursorTask = db.collection('task').find({});
        cursorTask.forEach((dbitem, index, arr) => {
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

    let dt = new Date();
    let d = dt.getFullYear() +'-'+ (dt.getMonth()+1) +'-'+ dt.getDate();

    mongo.connect(mongourl, (err, db) => {
        assert.equal(null, err);
        db.collection('task').insertOne({
            date: d,
            taskName: decodeURIComponent(name),
            status: 'Pending',
            taskProgress: prog
        });
        db.close();
        res.send('Success');
    });
});

router.get('/tickets', function(req, res, next) {
    "use strict";
    let dataTicket = [];
    mongo.connect(mongourl, (err, db) => {
        assert.equal(null, err);
        let cursorTicket = db.collection('tickets').find({});
        cursorTicket.forEach((dbitem, index, arr) => {
            assert.equal(null, index);
            dataTicket.push(dbitem);
        }, () => {
            db.close();
            res.json(dataTicket);
        });
    });
});

router.post('/ticketUpdate', function(req, res, next) {
    "use strict";
    let ticketId = req.body.id;
    ticketId = require('mongodb').ObjectID(ticketId);
    mongo.connect(mongourl, (err, db) => {
        assert.equal(null, err);
        db.collection('tickets').update({_id: ticketId}, {
            $set: {
                priority: 'Completed',
            }
        }, () => {
            db.close();
            res.send('Success');
        });
    });
});

router.post('/ticketAdd', function(req, res, next) {
    "use strict";
    let formData = req.body.formData;
    formData = formData.split('&');

    let cat = formData[0];
    cat = cat.substr(cat.indexOf("=") + 1);
    let name = formData[1];
    name = name.substr(name.indexOf("=") + 1);
    let title = formData[2];
    title = title.substr(title.indexOf("=") + 1);
    let prio = formData[3];
    prio = prio.substr(prio.indexOf("=") + 1);

    let dt = new Date();
    let monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let d = monthNames[dt.getMonth()] +' '+ dt.getDate() +','+ dt.getFullYear() +' '+ dt.getHours() +':'+ dt.getMinutes();

    let dataTickets = [];
    mongo.connect(mongourl, (err, db) => {
        assert.equal(null, err);
        let cursorTickets = db.collection('tickets').find({});
        cursorTickets.forEach((dbitem, index, arr) => {
            assert.equal(null, index);
            dataTickets.push(dbitem);
        }, () => {
            let currNo = dataTickets[dataTickets.length - 1].number;

            db.collection('tickets').insertOne({
                number: currNo + 1,
                date: d,
                category: decodeURIComponent(cat),
                name: decodeURIComponent(name),
                title: decodeURIComponent(title),
                priority: prio
            });

            db.close();
            res.send('Success');
        });
    });
});

router.get('/users', function(req, res, next) {
    "use strict";
    let dataUsers = [];
    mongo.connect(mongourl, (err, db) => {
        assert.equal(null, err);
        let cursorTicket = db.collection('userdata').find({});
        cursorTicket.forEach((dbitem, index, arr) => {
            assert.equal(null, index);
            dataUsers.push(dbitem);
        }, () => {
            db.close();
            res.json(dataUsers);
        });
    });
});

module.exports = router;