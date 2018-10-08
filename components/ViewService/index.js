import React, { Component } from 'react'
import {
  StyleSheet,
  Platform,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  Button,
  TextInput
} from 'react-native'
import servicesData from '@/data/services'
import config from '@/data/config'
import appStyles from '@/AppStyles'
import ListPopover from 'react-native-list-popover'
import uuid from 'uuid'

import { Constants, Permissions, LinearGradient } from 'expo'

import SendBird from 'sendbird'
var sb = null

const firebase = require('firebase')
require('firebase/firestore')

let image = require('@/assets/images/arrowBack.png')

const options = {
  allowsEditing: true,
}

export default class ViewService extends Component {
  constructor(props) {
    super(props)

    this.state = {
      category: '',
      listingId: '',
      listingTitle: '',
      price: '',
      description: '',
      location: '',
      imageOne: '',
      imageTwo: '',
      imageThree: '',
      seller: '',
      sellerId: '',
      currentUser: null
    }

    this.goBack = this.goBack.bind(this)
    this.handleBuy = this.handleBuy.bind(this)
  }

  componentDidMount() {
    const { currentUser } = firebase.auth()
    this.setState({ currentUser })

    // Get service

    let db = firebase.firestore()
    const { service } = this.props.navigation.state.params

    if (service !== undefined) {
      db.collection('services').where('listingId', '==', service.listingId).get().then((userDoc) => {
        if (!userDoc.empty) {
          let data = userDoc.docs[0].data()
          const { category, listingId, listingTitle, sellerId, price, description, location,
            imageOne, imageTwo, imageThree } = data
          this.setState({
            category,
            listingId,
            listingTitle,
            sellerId,
            price,
            description,
            location,
            imageOne,
            imageTwo,
            imageThree
          })
        }
      })

      db.collection('users').where('userId', '==', service.sellerId).get().then((userDoc) => {
        if (!userDoc.empty) {
          let data = userDoc.docs[0].data()
          this.setState({
            seller: `${data.firstName} ${data.surname}`
          })
        }
      })
    }
  }

  getCategoryContainerStyle() {
    if (Platform.OS === 'ios'
      && this.state.categoryOptionsVisible) {
      return {
        zIndex: 1
      }
    }
  }

  goBack() {
    this.props.navigation.goBack()
  }

  handleBuy() {
    const { currentUser } = firebase.auth()

    // to-do: check if we are already buying this, possibly hide from services list

    // add to lynks collection

    let db = firebase.firestore()

    let sellerId = this.state.sellerId
    let navigation = this.props.navigation

    if (sellerId === currentUser.uid) {
      return;
    }

    db.collection('lynks').add({
      sellerId: this.state.sellerId,
      buyerId: currentUser.uid,
      serviceId: this.state.listingId,
      sold: false,
      awaitingPayment: true
    })
    .then(function(docRef) {
      console.log('Document written with ID: ', docRef.id)

      sb = SendBird.getInstance()
      let userIds = [sellerId, currentUser.uid]

      sb.GroupChannel.createChannelWithUserIds(userIds, true, userIds.join(), '', '', '', function(createdChannel, error) {
        if (error) {
          console.error(error)
          return
        }

        console.log('created sendbird channel', createdChannel)

        navigation.navigate('Buying', { sendBirdChannel: createdChannel })
      })
    })
    .catch(function(error) {
      console.error('Error adding document: ', error)
    })
  }

  renderBuyButton() {
    if (this.state.sellerId !==  firebase.auth().currentUser.userId
    &&
      this.props.navigation.state.params.perspective === 'Buyer') {
      return (
        <TouchableOpacity
          style={[appStyles.buttonContainer, appStyles.button]}
          onPress={this.handleBuy}
        >
          <LinearGradient
            start={{x: 0, y: 0.75}} end={{x: 1, y: 0.25}}
            colors={['#0428CA', '#0464F4']}
            style={{ padding: 15, alignItems: 'center', width: 300, borderRadius: 10 }}>
            <Text style={appStyles.buttonText}>Buy</Text>
          </LinearGradient>
        </TouchableOpacity>
      )
    } else {
      return <View/>
    }
  }

  getPrice(price) {
    return '$' + price.replace(/[^0-9-.]/g, '');
  }

  setPrice(text) {
    let newText = text.replace(/$/, '');
    const price = '$' + newText;
    this.setState({ price })
  }

  render() {
    const { currentUser, seller } = this.state

    return (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={this.goBack}
          style={styles.button}
        >
          <Image
            source={image}
            style={styles.arrowBack}
         />
        </TouchableOpacity>
        <View style={appStyles.title}>
          <Text style={appStyles.titleText}>{seller}</Text>
        </View>
        <View style={styles.viewService}>
          <View style={styles.inputGroup}>
            <View style={appStyles.textInputContainer}>
              <TextInput
                editable={false}
                selectTextOnFocus={false}
                placeholder="Listing title"
                style={[appStyles.textInput, styles.field]}
                onChangeText={category => this.setState({ category })}
                value={this.state.category}/>
              </View>
            <View style={appStyles.textInputContainer}>
              <TextInput
                editable={false}
                selectTextOnFocus={false}
                placeholder="Listing title"
                style={[appStyles.textInput, styles.field]}
                onChangeText={listingTitle => this.setState({ listingTitle })}
                value={this.state.listingTitle}/>
              </View>
            <View style={[appStyles.textInputContainer]}>
              <TextInput
                editable={false}
                selectTextOnFocus={false}
                placeholder="Price"
                style={[appStyles.textInput, styles.field]}
                onChangeText={text => this.setPrice(text)}
                value={this.state.price}/>
              </View>
            <View style={[appStyles.textInputContainer, styles.textAreaContainer]}>
              <TextInput
                editable={false}
                selectTextOnFocus={false}
                multiline={true}
                numberOfLines={4}
                placeholder="Detailed description"
                style={[appStyles.textInput, styles.field, styles.textArea]}
                onChangeText={description => this.setState({ description })}
                value={this.state.description}/>
            </View>
            <View style={appStyles.textInputContainer}>
              <TextInput
                editable={false}
                selectTextOnFocus={false}
                placeholder="Location"
                style={[appStyles.textInput, styles.field]}
                onChangeText={location => this.setState({ location })}
                value={this.state.location}/>
              </View>

            <View style={[appStyles.row, styles.images]}>
              <TouchableOpacity
                style={[styles.photoContainer]}
              >
                <View style={[styles.textInput]}>
                  {this.state.imageOne !== '' ?
                    <Image
                      source={{ uri: this.state.imageOne}}
                      style={styles.photo}
                    />
                  :
                    <Text style={styles.photoText}>Select</Text>
                  }
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.photoContainer]}
              >
                <View style={[styles.textInput]}>
                  {this.state.imageTwo !== '' ?
                    <Image
                      source={{ uri: this.state.imageTwo}}
                      style={styles.photo}
                    />
                  :
                    <Text style={styles.photoText}>Select</Text>
                  }
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.photoContainer]}
              >
                <View style={[styles.textInput]}>
                  {this.state.imageThree !== '' ?
                    <Image
                      source={{ uri: this.state.imageThree}}
                      style={styles.photo}
                    />
                  :
                    <Text style={styles.photoText}>Select</Text>
                  }
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={styles.buyButton}>
          {this.renderBuyButton()}
        </View>
      </View>
    )
  }


}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  viewService: {
    width: '70%',
    position: 'absolute',
    top: 10,
    left: '0%'
  },
  inputGroup: {
    position: 'absolute',
    top: 40
  },
  button: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 10,
  },
  arrowBack: {
    width: 32,
    height: 32
  },
  title: {
    position: 'relative',
    bottom: 10,
  },
  textInput: {
    width: '80%',
    margin: 5,
  },
  price: {
    width: 150
  },
  textAreaContainer: {
    // width: '80%',
    height: 100,
    // margin: 5,
  },
  textArea: {
    flex: 1,
  },
  confirmButton: {
    position: 'absolute',
    bottom: 20
  },
  images: {
    marginTop: 20
  },
  photoText: {
    textAlign: 'center',
    paddingTop: 40
  },
  photoContainer: {
    width: 100,
    height: 100,
    // borderWidth: 1,
    // borderColor: '#ccc',
    // backgroundColor: '#eee',
    // borderRadius: 3,
    margin: 4
  },
  photo: {
    width: 100,
    height: 100
  },
  field: {
    borderBottomWidth: 0
  },
  buyButton: {
    position: 'absolute',
    bottom: 20
  }
})
