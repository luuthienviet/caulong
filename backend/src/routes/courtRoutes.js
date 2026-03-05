const express = require('express');
const router = express.Router();
const courtController = require('../controllers/courtController');

router.get('/', courtController.getCourts);
router.post('/', courtController.createCourt);

module.exports = router;
