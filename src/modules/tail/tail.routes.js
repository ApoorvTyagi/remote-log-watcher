const path = require('path');
const express = require('express');
const router = express.Router();

router.get('/log', (_req, res) => {
    const htmlFile = path.join(__dirname, '../../views/index.html');
    res.sendFile(htmlFile, (err) => {
        if (err) throw new Error('Error while serving HTML', err);
    })
})

module.exports = router;