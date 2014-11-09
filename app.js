var stripe = require('stripe')(process.env.STRIPE_KEY),
    express = require('express'),
    bodyParser = require('body-parser'),
    port = process.env.PORT || 3000,
    app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

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
        if (err) console.warn(err);

        if (!customer || !customer.id) res.send(500);
        charge.customer = customer.id;

        stripe.charges.create(charge, function(err, data) {
            if (err) console.warn(err);

            res.redirect(b.success || req.headers['referer']);
        });
    });
});

app.listen(port);
console.log('Listening on port ' + port);
