const functions = require('firebase-functions')
const cors = require('cors')
const express = require('express')
const app1 = express()
const app2 = express()
const app3 = express()
const app4 = express()
const stripe = require('stripe')('sk_test_JpUpL4WrvXIcbdLif7aeWB2A')
const bodyParser = require('body-parser')
const nodeMailer = require('nodemailer')

app1.get('/create-stripe-account', (req, res) => {
  stripe.accounts.create({
    country: 'US',
    type: 'custom'
  }).then((data) => {
    res.status(200).send(JSON.stringify(data))
  }).catch((e)=> {
    console.log('error')
    console.log(e)
  })
})

const api1 = functions.https.onRequest(app1)

app2.use(bodyParser.json()) // support json encoded bodies
app2.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies

app2.post('/charge', (req, res) => {
  let chargeData = req.body
  const destinationAccount = chargeData.destinationAccount
  delete chargeData.destinationAccount
  chargeData.destination = {
    "account": destinationAccount
  }

  stripe.charges.create(chargeData).then(function(charge) {
    res.json(charge)
  })
})

const api2 = functions.https.onRequest(app2)

app3.use(bodyParser.json()) // support json encoded bodies
app3.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies

app3.post('/payout', (req, res) => {
  stripe.accounts.update(
    req.body.destinationAccount,
    {
      tos_acceptance: {
        date: Math.floor(Date.now() / 1000),
        ip: req.body.ip // Assumes you're not using a proxy
      }
    }
  )

  stripe.accounts.update(req.body.destinationAccount, {
    external_account: req.body.cardToken,
    "payout_schedule": {
      "interval": "manual"
    },
  }).then(function(account) {
    console.log('created account', account)
    stripe.payouts.create({
      amount: 1,
      currency: "usd",
      destination: account.ID,
      method: "instant"
    },
      {stripe_account: req.body.destinationAccount}
    ).then(function(payout) {
      res.json(payout)
    })
  })
})

const api3 = functions.https.onRequest(app3)

app4.use(bodyParser.json()) // support json encoded bodies
app4.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies

app4.post('/forgot-password', (req, res) => {
  const email = req.body.emailAddress;
  const password = req.body.existingPassword;
  let transporter = nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'servlynkapp@gmail.com',
      pass: 'servlynk1234'
    }
  });
  let mailOptions = {
    from: '"Servlynk" <servlynkapp@gmail.com>',
    to: email,
    subject: 'Forgot password reminder',
    text: 'Password:',
    html: `<b>${password}</b>`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message %s sent: %s', info.messageId, info.response);
    res.status(200).send(JSON.stringify({ message: 'sent'}))
  });
});

const api4 = functions.https.onRequest(app4)

module.exports = {
  api1, api2, api3, api4
}
