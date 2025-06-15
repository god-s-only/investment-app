const express = require('express');
const router = express.Router();
const fetch = require('node-fetch'); // npm install node-fetch

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('home', { title: 'EquiTrust' });
});

router.get('/api/crypto', async (req, res) => {
  try {
    const url = 'https://corsproxy.io/?https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,tether,binancecoin,solana,ripple,cardano,dogecoin';
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch crypto data' });
  }
});

router.get('/signup', function(req, res, next) {
  res.render('signup', { title: 'Sign Up | EquiTrust' });
});

router.get('/dashboard', function(req, res, next) {
  res.render('dashboard', { title: 'Dashboard | EquiTrust' });
});

module.exports = router;