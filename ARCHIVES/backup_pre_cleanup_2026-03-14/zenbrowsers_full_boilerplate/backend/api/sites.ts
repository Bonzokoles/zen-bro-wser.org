import express from 'express';
const router = express.Router();
const sites = [];
router.get('/', (req, res) => { res.json(sites); });
router.post('/', (req, res) => { const site = req.body; site.id = Date.now().toString(); sites.push(site); res.status(201).json(site); });
export default router;
