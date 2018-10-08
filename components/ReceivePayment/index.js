import React, { Component } from 'react'
import {
  StyleSheet,
  Platform,
  Text,
  View,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  FlatList,
  TextInput,
  Dimensions
} from 'react-native'
import { LinearGradient } from 'expo'
import SideMenu from 'react-native-side-menu'
import Menu from '@/components/Menu'
import appStyles from '@/AppStyles'
import { FormLabel, FormInput, FormValidationMessage } from 'react-native-elements'

import Stripe from 'react-native-stripe-api'
const apiKey = 'sk_test_JpUpL4WrvXIcbdLif7aeWB2A'
const client = new Stripe(apiKey)

import SendBird from 'sendbird'
var sb = null

const firebase = require('firebase')
require('firebase/firestore')

let image = require('@/assets/images/hamburger.png')

let createPayout = `https://us-central1-serv-lynk.cloudfunctions.net/api3/payout`

export default class ReceivePayment extends Component {
  constructor(props) {
    super(props)

    this.toggle = this.toggle.bind(this)
    this.onPressConfirm = this.onPressConfirm.bind(this)

    this.state = {
      currentUser: null,
      number: '',
      exp_month: '',
      exp_year: '',
      currency: '',
      cvc: '',
      stripeToken: '',
      sellerStripeId: '',
    }
  }

  componentDidMount() {
    const { currentUser } = firebase.auth()
    this.setState({ currentUser })
    let db = firebase.firestore()

    let self = this
    db.collection('users').where('userId', '==', currentUser.uid).get().then((userDoc) => {
      if (!userDoc.empty) {
        let data = userDoc.docs[0].data()
        self.setState({ sellerStripeId: data.stripeId })
      }
    })
  }

  onPressConfirm() {
    console.log('Validating...');
    const { number, exp_month, exp_year, cvc } = this.state;

    if (number === '') {
      this.setState({ errorMessage: 'Please enter card number.' });
      return;
    }
    if (exp_month === '') {
      this.setState({ errorMessage: 'Please enter MM.' });
      return;
    }
    if (exp_year === '') {
      this.setState({ errorMessage: 'Please enter YY.' });
      return;
    }
    if (cvc === '') {
      this.setState({ errorMessage: 'Please enter CVC.' });
      return;
    }

    if (number.length !== 16 || isNaN(number)) {
      this.setState({ errorMessage: 'Card number must be 16 digits long' })
      return
    }
    if (exp_month.length !== 2 || isNaN(exp_month)) {
      this.setState({ errorMessage: 'Month must be 2 digits long' })
      return
    }
    if (exp_year.length !== 2 || isNaN(exp_year)) {
      this.setState({ errorMessage: 'Year must be 2 digits long' })
      return
    }
    if (cvc.length !== 3 || isNaN(cvc)) {
      this.setState({ errorMessage: 'Cvc number must be 3 digits long' })
      return
    }

    this.processBankDetails()
  }

  processBankDetails() {
    let self = this

    const { routingNumber, accountNumber  } = this.state
    const testCard = {
      number: '4000056655665556',
      exp_month: '09',
      exp_year: '18',
      currency: 'usd',
      cvc: '111',
    }

    const { number, exp_month, exp_year, cvc, currency } = testCard
    // const { number, exp_month, exp_year, cvc, currency } = this.state

    client.createToken({
       number, exp_month, exp_year, cvc, currency
    }).done((cardToken)=>{
      self.receiveFunds(cardToken)
    })

    // client.stripePostRequest('tokens', {
    //   // bank_account: {
    //     'bank_account[country]': 'US',
    //     'bank_account[currency]': 'usd',
    //     'bank_account[account_holder_name]': 'Jenny Rosen',
    //     'bank_account[account_holder_type]': 'individual',
    //     'bank_account[routing_number]': '110000000',
    //     'bank_account[account_number]': '000123456789'
    //   // }
    // }).done((accountToken)=>{
    //   self.receiveFunds(accountToken)
    //   console.log('charge successful')
    // })
  }

  async receiveFunds(accountToken) {

    let self = this
    const ip = await fetch(`https://api.ipify.org?format=json`).then(function(response) {
      return response.json();
    })
    .then(function(json) {
      console.log(JSON.stringify(json));

      const payoutData = {
        "amount": 50,
        "currency": "usd",
        "cardToken": accountToken.id,
        "description": "description",
        "destinationAccount": self.state.sellerStripeId,
        ip: json.ip
      }

      const res = fetch(createPayout, {
        method: 'POST',
        body: JSON.stringify(payoutData),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      }).then((complete) => {

        let db = firebase.firestore()
        db.collection('lynks').where('serviceId', '==',
          self.props.navigation.state.params.item.listingId).get().then((lynkDoc) => {
          if (!lynkDoc.empty) {
            let data = lynkDoc.docs
            for (let i = 0; i < data.length; i++) {
              let doc = data[i].ref.delete()
            }
          }
        })

        self.props.navigation.navigate('Selling')

      }).catch(function(error) {
        console.error('Error creating payout: ', error)
      })
    });
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen,
    })
  }

  updateMenuState(isOpen) {
    this.setState({ isOpen })
  }

  onMenuItemSelected = (item) => {
    if (item === 'Logout') {
      firebase.auth().signOut()
      item = 'Login'
    }
    this.setState({
      isOpen: false,
      selectedItem: item,
    })
    this.props.navigation.navigate(item)
  }

  render() {
    const { currentUser } = this.state
    const menu = <Menu onItemSelected={this.onMenuItemSelected} />

    return (
      <SideMenu
        menu={menu}
        isOpen={this.state.isOpen}
        onChange={isOpen => this.updateMenuState(isOpen)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <TouchableOpacity
              onPress={this.toggle}
              style={styles.button}
            >
              <Image
                source={image}
                style={styles.hamburger}
              />
            </TouchableOpacity>
            { this.state.errorMessage !== '' &&
              <Text style={{ color: 'red', position: 'relative', top: -30, width: 250 }}>
                {this.state.errorMessage}
              </Text>
            }
            <View style={appStyles.textInputContainer}>
              <TextInput
                keyboardType='numeric'
                placeholder="Card Number"
                style={appStyles.textInput}
                onChangeText={number => this.setState({ number })}
                value={this.state.number}
                underlineColorAndroid='transparent'
              />
            </View>
            <View style={appStyles.textInputContainer}>
              <View style={[styles.wrapper, {flexDirection: 'row', alignSelf: 'center'}]}>
                <View style={appStyles.column}>
                  <TextInput
                    keyboardType='numeric'
                    placeholder="MM"
                    style={styles.textInput}
                    onChangeText={exp_month => this.setState({ exp_month })}
                    value={this.state.exp_month}
                    underlineColorAndroid='transparent'
                  />
                </View>
                <View style={[appStyles.column, styles.forwardSlash]}>
                  <Text>/</Text>
                </View>
                <View style={appStyles.column}>
                  <TextInput
                    keyboardType='numeric'
                    placeholder="YY"
                    style={styles.textInput}
                    onChangeText={exp_year => this.setState({ exp_year })}
                    value={this.state.exp_year}
                    underlineColorAndroid='transparent'
                  />
                </View>
              </View>
            </View>
            <View style={appStyles.textInputContainer}>
              <TextInput
                keyboardType='numeric'
                placeholder="CVC"
                style={appStyles.textInput}
                onChangeText={cvc => this.setState({ cvc })}
                value={this.state.cvc}
                underlineColorAndroid='transparent'
              />
            </View>
            <TouchableOpacity
              onPress={this.onPressConfirm}
              style={styles.confirmButton}
            >
              <LinearGradient
                start={{x: 0, y: 0.75}} end={{x: 1, y: 0.25}}
                colors={['#0428CA', '#0464F4']}
                style={{ padding: 15, alignItems: 'center', width: 300, borderRadius: 10 }}>
                <Text style={appStyles.buttonText}>Transfer funds</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </SideMenu>
    )
  }
}

const listWidth = Dimensions.get('window').width - 80

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    width: '100%'
  },
  button: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 10,
  },
  hamburger: {
    width: 32,
    height: 32,
    position: 'relative',
    top: 5
  },
  list: {
    position: 'absolute',
    width: listWidth,
    height: Dimensions.get('window').height - 160,
    top: 80,
    left: (Dimensions.get('window').width - listWidth) / 2
  },
  flatlist: {
    flexDirection: 'column',
  },
  service: {
    margin: 5,
    marginRight: 10,
    flex: 1
  },
  image: {
    width: 130,
    height: 130,
    borderRadius: 5
  },
  listingText: {
    fontSize: 12
  },
  listingPriceText: {
    fontSize: 14
  },
  confirmButton: {
    position: 'absolute',
    bottom: 20
  },
  forwardSlash: {
    position: 'relative',
    left: 45,
    top: 15
  },
  confirmButton: {
    marginTop: 40
  },
  month: {
    marginLeft: 20
  },
  textInput: {
    height: 40,
    width: '100%',
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
    marginTop: 8
  },
  wrapper: {
    height: 40,
    width: Dimensions.get("window").width * 0.8,
  }
})
