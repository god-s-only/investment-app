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

router.get('/signin', function(req, res, next) {
  res.render('signin', { title: 'Sign In | EquiTrust' });
});

router.get('/dashboard', (req, res) => {
  res.render('dashboard', { 
    title: 'EquiTrust - Dashboard',
    page: 'dashboard' 
  });
});

router.get('/investment-plans', function(req, res, next) {
  res.render('investment-plans', { title: 'Investment Plans | EquiTrust' });
});

router.get('/about', function(req, res, next) {
  res.render('about', { title: 'About | EquiTrust' });
});

router.get('/contact', function(req, res, next) {
  res.render('contact', { title: 'Contact | EquiTrust' });
});

router.get('/blog', function(req, res, next) {
  res.render('blog', { title: 'Blog | EquiTrust' });
});
router.get('/deposit', function(req, res, next) {
  res.render('deposit', { title: 'Deposit | EquiTrust' });
});
router.get('/transaction-log', function(req, res, next) {
  res.render('transaction', { title: 'Transaction | EquiTrust' });
});

router.get('/withdraw', function(req, res, next) {
  res.render('withdraw', { title: 'Withdraw | EquiTrust' });
});
router.get('/investment', function(req, res, next) {
  res.render('investment', { title: 'Investment | EquiTrust' });
});

module.exports = router;