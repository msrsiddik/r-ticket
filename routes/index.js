const express = require('express');
const router = express.Router();

const {cipher, decipher} = require('../public/javascripts/encryption.js')
const {getBody, getScript} = require('../public/javascripts/danger.js')

/* GET home page. */
router.get('/', function (req, res, next) {
    res.send(
        getBody(req)
    )
});

router.get('/:c', function (req, res) {
    const coachNo = req.params.c;

    res.send(
        getBody(req, coachNo)
    )
});

router.get('/:c/:h', function (req, res, next) {
    const coachNo = req.params.c;
    const hours = req.params.h;

    res.send(
        getBody(req, coachNo, hours)
    )
});

router.get('/:c/:h/:m', function (req, res, next) {

    const coachNo = req.params.c;
    const hours = req.params.h;
    const minutes = req.params.m;

    res.send(
        getBody(req, coachNo, hours, minutes)
    )
});

router.post('/', function (req, res, next) {
    const pass = req.body.p;
    const hours = req.body.h;
    const minutes = req.body.m;
    const second = req.body.s;
    const millisecond = req.body.ms;
    const subMillisecond = req.body.sms;
    const reverse = req.body.r;
    const className = req.body.cn;
    const classNo = req.body.c;
    const maxSeat = req.body.mx;

    let script = getScript(classNo, hours, minutes, second, millisecond, subMillisecond, reverse, className, maxSeat);

    let dt = new Date();
    const myCipher = cipher('' + (dt.getFullYear() - dt.getMonth() - dt.getDate() - 1));
    script = myCipher(script);

    if (pass != null) {
        const myDecipher = decipher(eval(pass).toString());
        script = myDecipher(script);
    }

    res.send(script);
});

module.exports = router;
