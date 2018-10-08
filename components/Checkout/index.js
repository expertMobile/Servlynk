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
import { Col, Row, Grid } from "react-native-easy-grid"

import Stripe from 'react-native-stripe-api'
const apiKey = 'sk_test_JpUpL4WrvXIcbdLif7aeWB2A'
const client = new Stripe(apiKey)

import SendBird from 'sendbird'
var sb = null

const firebase = require('firebase')
require('firebase/firestore')

let image = require('@/assets/images/hamburger.png')

let createStripeAccount = `https://us-central1-serv-lynk.cloudfunctions.net/api1/create-stripe-account`
let createCharge = `https://us-central1-serv-lynk.cloudfunctions.net/api2/charge`

export default class Services extends Component {
  constructor(props) {
    super(props)

    this.toggle = this.toggle.bind(this)
    this.onPressConfirm = this.onPressConfirm.bind(this)

    this.state = {
      currentUser: null,
      number: '',
      exp_month: '',
      exp_year: '',
      cvc: '',
      stripeToken: '',
      errorMessage: ''
    }
  }

  componentDidMount() {
    const { currentUser } = firebase.auth()
    this.setState({ currentUser })
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

    // check for the existence of a stripeId in the seller user document

    const { sellerId } = this.props.navigation.state.params.item
    let self = this
    let db = firebase.firestore()

    db.collection('users').where('userId', '==', sellerId).get().then((userDoc) => {
      if (!userDoc.empty) {
        let data = userDoc.docs[0].data()
        if (data.stripeId && data.stripeId !== '') {
          // account exists, use id as the charge destination account
          self.setState({
            sellerStripeId: data.stripeId
          })
          self.processCard()
        } else {
          // account doesnt exist, create a stripe account and store the id in the seller
          self.createStripeSellerAccount()
        }
      }
    })
  }

  async createStripeSellerAccount() {
    let self = this

    const res = await fetch(createStripeAccount, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer sk_test_JpUpL4WrvXIcbdLif7aeWB2A`,
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    })

    const acct = await res.json().catch((e)=>{
      console.log(e)
    })

    let db = firebase.firestore()
    const { sellerId } = this.props.navigation.state.params.item

    db.collection('users').where('userId', '==', sellerId).get().then((userDoc) => {

      // Store sellerId in state for the charge destination account

      self.setState({
        sellerStripeId: acct.id
      })

      // Update seller with newly created account id saved as stripeId

      let self2 = self

      userDoc.docs[0].ref.update({
        stripeId: acct.id
      })

      self.processCard()
    })
  }

  processCard() {
    let self = this

    const testCard = {
      number: '4000000000000077',
      exp_month: '09',
      exp_year: '18',
      cvc: '111',
    }

    // const { number, exp_month, exp_year, cvc  } = this.state
    const { number, exp_month, exp_year, cvc  } = testCard

    client.createToken({
       number, exp_month, exp_year, cvc,
    }).done((cardToken)=>{
      self.createCharge(cardToken)
    })
  }

  async createCharge(cardToken) {
    let self = this

    // post the charge data to the server side

    // customer: customer.id,
    const chargeData = {
      "amount": 50,
      "currency": "usd",
      "source": cardToken.id,
      "description": "description",
      "destinationAccount": this.state.sellerStripeId
    }

    const res = await fetch(createCharge, {
      method: 'POST',
      body: JSON.stringify(chargeData),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    }).catch(function(error) {
      console.error('Error creating charge: ', error)
    })

    const chargeComplete = await res.json().catch((e)=>{
      console.log(e)
    })

    // set the lynk to sold and awaiting payment

    let listingId = self.props.navigation.state.params.item.listingId

    let db = firebase.firestore()

    db.collection('lynks').where('serviceId', '==', listingId).get().then((lynkDoc) => {
      if (!lynkDoc.empty) {
        let data = lynkDoc.docs

        lynkDoc.docs[0].ref.update({
          sold: true, awaitingPayment: false
        }).then(() => {
          console.log('Updated lynk')
          self.props.navigation.navigate('Buying', { refresh: true })
        }, (error) => {
          console.log('Update user error')
        })
      }
    })

    // connect to chat, and send a message to both users

    sb = SendBird.getInstance()

    const sbird = sb
    const userIds = [
      self.props.navigation.state.params.item.sellerId,
      self.state.currentUser.uid
    ]
    const message = 'Service purchased successfully'
    const messageData = `{ "sender": "${this.state.currentUser.uid}", "listingId": "${this.state.listingId}" }`

    sb.GroupChannel.createChannelWithUserIds(userIds, true, userIds.join(), '', '', '', function(createdChannel, error) {
      if (error) {
        console.error(error)
        return
      }
      console.log('channel found:', createdChannel)
      const self2 = self
      createdChannel.sendUserMessage('This service has been paid', messageData, '', function(message, error){
        if (error) {
          console.error('error sending message', error)
          return
        } else {
          console.log('sent purchase message', message)
        }
      })
    })

    // client.stripePostRequest('charges', {
    //   amount: 50,
    //   currency: 'usd',
    //   // customer: customer.id,
    //   source: cardToken.id,
    //   description: 'description',
    //   destination: {
    //     account: this.state.sellerStripeId,
    //   },
    // }).done((charge)=>{
    //   console.log('charge successful')
    // })
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
                style={{ padding: 15, alignItems: 'center', width: 300, borderRadius: 10 }}
              >
                <Text style={appStyles.buttonText}>Confirm</Text>
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
