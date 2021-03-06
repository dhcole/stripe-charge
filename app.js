var stripe = require('stripe')(process.env.STRIPE_KEY),
    express = require('express'),
    bodyParser = require('body-parser'),
    port = process.env.PORT || 3000,
    app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.get('/api/health', function(req, res) {
  res.send(200);
});

app.post('/api/charge', function(req, res) {
  var b = req.body,
      token = b.stripeToken,
      metaData = {
        fname: b.fname,
        lname: b.lname,
        phone: b.phone,
        email: b.email,
        address: b.address,
        city: b.city,
        state: b.state,
        zip: b.zip
      },
      customer = {
        description: 'Online customer',
        card: token,
        email: b.email,
        metadata: metaData
      },
      charge = {
        amount: b.amount * 100,
        currency: 'usd',
        description: 'Online charge',
        metadata: metaData

      };

    stripe.customers.create(customer, function(err, customer) {
      if (err || !customer || !customer.id) {
        error(err, res, b);
        return;
      }

      charge.customer = customer.id;

      stripe.charges.create(charge, function(err, data) {
        if (err) {
          error(err, res, b);
          return;
        }

        res.redirect(b.success || req.headers['referer']);
      });
    });
});

function error(err, res, b) {
  var msg = '',
      url = '';

  console.warn(err);

  if (b && b.error) {
    msg = (err && err.message) ? err.message : '';
    url = b.error + '?error=' + encodeURIComponent(msg);
    res.redirect(url);
  } else{
    res.send(500);
  }
}

app.listen(port);
console.log('Listening on port ' + port);
