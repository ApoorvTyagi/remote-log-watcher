const express = require('express');
const router = express.Router();

const setupRoutes = () => {
    const moduleRouter = require('./tail/tail.routes');
    router.use('/', moduleRouter);
    return router;
};

module.exports = {
    setupRoutes,
};