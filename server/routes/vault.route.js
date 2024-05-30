const express = require('express');
const router =express.Router();
const vaultCtrl = require('../controllers/vault.controller');

router.route('/vaults').get(vaultCtrl.list_vault)
router.route('/vault_detail').get(vaultCtrl.information)
router.route('/vault_signal').get(vaultCtrl.public_signal)
router.route('/members').get(vaultCtrl.members)

module.exports = router