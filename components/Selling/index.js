import React, { Component } from 'react'
import {
  StyleSheet,
  Platform,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions
} from 'react-native'
import SideMenu from 'react-native-side-menu'
import Menu from '@/components/Menu'
import appStyles from '@/AppStyles'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { Col, Row, Grid } from 'react-native-easy-grid'

import SendBird from 'sendbird'
var sb = null

const firebase = require('firebase')
require('firebase/firestore')

let image = require('@/assets/images/hamburger.png')

export default class Selling extends Component {
  constructor(props) {
    super(props)

    this.toggle = this.toggle.bind(this)
    this.onPressView = this.onPressView.bind(this)
    this.onPressDelete = this.onPressDelete.bind(this)
    this.onPreChatew = this.onPressChat.bind(this)
    this.onPressFunds = this.onPressFunds.bind(this)

    this.state = {
      currentUser: null,
      isOpen: false,
      selectedItem: 'About',
      services: [],
      lynks: []
    }
  }

  async componentDidMount() {
    const { currentUser } = firebase.auth()
    this.setState({ currentUser })

    let db = firebase.firestore()

    // get user

    db.collection('users').where('userId', '==', currentUser.uid).get().then((userDoc) => {
      if (!userDoc.empty) {
        let data = userDoc.docs[0].data()
        this.setState({
          firstName: data.firstName,
          surname: data.surname,
          emailAddress: data.emailAddress,
          location: data.location
        })
      }
    })

    db.collection('lynks').where('sellerId', '==', currentUser.uid).get().then((lynks) => {
      lynks.forEach((doc) => {
        let lynk = doc.data()
        let alllynks = this.state.lynks
        alllynks.push(lynk)
        console.log(doc.data());
        this.setState({ lynks:alllynks })
        this.forceUpdate()
      })
    })

    // find all listings we are selling

    let services = await db.collection('services').where('sellerId', '==', currentUser.uid).get()

    services.forEach((doc) => {
      let service = doc.data()
      let services = this.state.services
      services.push(service)
      console.log(doc.data());
      this.setState({ services })
    })
  }

  async getLynk() {

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

  getFundsCount(item) {
    let lynk = {}
    let sold = false
    this.state.lynks.forEach((lynk) => {
      if (lynk.serviceId === item.listingId) {
        sold = lynk.sold
      }
    })
    if (!sold) {
      return <View/>
    } else {
      return (
        <Row>
          <TouchableOpacity
            onPress={() => this.onPressFunds(item)}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.fundsCountText}>{
                item.price
              }</Text>
            </View>
            <Text style={[styles.iconLabelText, styles.fundsIconText]}>Funds</Text>
          </TouchableOpacity>
        </Row>
      )
    }
  }

  renderItem = ({ item }) => {
    return (
      <Grid style={styles.grid}>
        <Row>
          <Col style={{ width: 80 }}>
            <TouchableOpacity onPress={() => this.onPressView(item)}>
              <Image
                style={styles.thumbnail}
                source={{ uri: item.imageOne }}
              />
            </TouchableOpacity>
          </Col>
          <Col style={styles.actionRow}>
            <Row>
              <TouchableOpacity onPress={() => this.onPressView(item)}>
                <Text style={[styles.listingTitleText]}>{item.listingTitle}</Text>
              </TouchableOpacity>
            </Row>
            <Row>
              <Col>
                <Row>
                  <TouchableOpacity
                    onPress={() => this.onPressDelete(item)}
                  >
                    <View style={styles.iconContainer}>
                      <Icon style={[styles.buyingIcon, styles.deleteIcon]} name='close' size={20} color='#0464F4'/>
                    </View>
                    <Text style={[styles.iconLabelText, styles.deleteIconText]}>Delete</Text>
                  </TouchableOpacity>
                </Row>
              </Col>
              <Col>
                <Row>
                  <TouchableOpacity
                    onPress={() => this.onPressChat(item)}
                  >
                    <View style={[styles.iconContainer, styles.chatIcon]}>
                      <Icon style={styles.buyingIcon} name='comment' size={20} color='#0464F4'/>
                    </View>
                    <Text style={[styles.iconLabelText, styles.chatIconText]}>Chat</Text>
                  </TouchableOpacity>
                </Row>
              </Col>
              <Col>
                {this.getFundsCount(item)}
              </Col>
            </Row>
          </Col>
        </Row>
      </Grid>
    )
  }

  onPressView(item) {
    this.props.navigation.navigate('ViewService', {
      service: item,
      perspective: 'Seller'
    })
  }

  onPressDelete(item) {
    // remove this service
    let db = firebase.firestore()
    db.collection('services').where('sellerId', '==',
      item.sellerId).get().then((lynkDoc) => {
      if (!lynkDoc.empty) {
        let data = lynkDoc.docs
        for (let i = 0; i < data.length; i++) {
          let doc = data[i].ref.delete()
        }
      }
    })

    // remove this lynk
    db.collection('lynks').where('serviceId', '==',
      item.listingId).get().then((lynkDoc) => {
      if (!lynkDoc.empty) {
        let data = lynkDoc.docs
        for (let i = 0; i < data.length; i++) {
          let doc = data[i].ref.delete()
        }
      }
    })

    // destroy sendbird channel (to-do)
    let services = this.state.services
    services.splice(services.indexOf(item), 1)
    this.setState({
      services
    })
  }

  onPressChat(item) {
    let buyerLynks = this.state.lynks.filter((lynk) => {
      if (item.listingId === lynk.serviceId) {
        return lynk
      }
    })
    let buyerIds = buyerLynks.map((buyerLynk) => {
      return buyerLynk.buyerId
    })
    this.props.navigation.navigate('Chat', {
      item,
      perspective: 'Selling',
      listingId: item.listingId,
      buyerIds,
      sellerId: item.sellerId
    })
  }

  onPressFunds(item) {
    this.props.navigation.navigate('ReceivePayment', {
      item
    })
  }

  renderList() {
    if (this.state.services.length > 0) {
      return (
        <FlatList
          style={styles.flatlist}
          data={this.state.services}
          showsHorizontalScrollIndicator={false}
          renderItem={this.renderItem}
          initialNumToRender={8}
          numColumns={1}
          keyExtractor={item => item.listingId}
        />
      )
    } else {
     return (
        <View/>
      )
    }
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
          <View style={appStyles.title}>
            <Text style={appStyles.titleText}>Selling</Text>
          </View>
          <View style={styles.list}>
            {this.renderList(this.state.services)}
          </View>
        </View>
      </SideMenu>
    )
  }
}

const listWidth = Dimensions.get('window').width

const styles = StyleSheet.create({
  grid: {
    height: 100,
  },
  item: {
    width: '100%'
  },
  iconLabelText: {
    color: "#999",
  },
  deleteIconText: {
    position: 'relative',
    right: 0,
  },
  deleteIcon: {
    position: 'relative',
    left: 10,
  },
  chatIcon: {
    position: 'relative',
    left: 6,
  },
  chatIconText: {
    position: 'relative',
    right: 0,
  },
  fundsCountText: {
    color: "#0464F4",
    opacity: 0.8,
  },
  buyingIcon: {
    color: "#0464F4",
    opacity: 0.8,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
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
  actionRow: {
    position: 'relative',
    bottom: 12,
    left: 6,
    paddingLeft: 0
  },
  list: {
    position: 'absolute',
    width: listWidth,
    height: Dimensions.get('window').height - 80,
    top: 80,
  },
  flatlist: {
    flexDirection: 'column',
  },
  service: {
    margin: 10,
    padding: 30,
    flex: 1,
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 3
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 5,
    position: 'relative',
    bottom: 0,
    left: 10
  },
  listingTitleText: {
    fontSize: 20,
    position: 'relative',
    top: 8,
    fontWeight: '100'
  },
  descriptionText: {
    textAlign: 'left',
    fontSize: 14,
    position: 'absolute',
    left: 200,
    top: -3
  }
})
