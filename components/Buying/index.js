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
import servicesData from '@/data/services'
import config from '@/data/config'
import appStyles from '@/AppStyles'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { Col, Row, Grid } from "react-native-easy-grid"

const firebase = require('firebase')
require('firebase/firestore')

let image = require('@/assets/images/hamburger.png')

export default class Buying extends Component {
  constructor(props) {
    super(props)

    this.toggle = this.toggle.bind(this)
    this.onPressView = this.onPressView.bind(this)
    this.onPressDelete = this.onPressDelete.bind(this)
    this.onPressChat = this.onPressChat.bind(this)
    this.onPressBuy = this.onPressBuy.bind(this)

    this.state = {
      currentUser: null,
      isOpen: false,
      selectedItem: 'About',
      services: [],
      lynks: []
    }
  }

  componentDidMount() {
    const { currentUser } = firebase.auth()
    this.setState({ currentUser })
    this.setState({ emailAddress: currentUser.email })

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

    // find all listings we are buying
    db.collection('lynks').where('buyerId', '==', currentUser.uid).get().then((userDoc) => {
      if (!userDoc.empty) {
        let data = userDoc.docs
        let thisState = this.state
        let self = this
        data.forEach((item) => {
          let lynk = item.data()
          let newSelf = self
          let lynks = self.state.lynks
          lynks.push(lynk)
          self.setState({ lynks })
          db.collection('services').where('listingId', '==', lynk.serviceId).get().then((userDoc) => {
            if (!userDoc.empty) {
              let data = userDoc.docs[0].data()
              let services = newSelf.state.services
              services.push(data)
              newSelf.setState({ services })
              console.log('services', newSelf.state.services)
            }
          })
        })
      }
    })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.navigation.state.params.refresh) {
      this.reloadList()
    }
  }

  reloadList() {
    this.setState({ lynks: [], services: [] })
    const { currentUser } = firebase.auth()
    let db = firebase.firestore()
    // find all listings we are buying
    db.collection('lynks').where('buyerId', '==', currentUser.uid).get().then((userDoc) => {
      if (!userDoc.empty) {
        let data = userDoc.docs
        let thisState = this.state
        let self = this
        data.forEach((item) => {
          let lynk = item.data()
          let newSelf = self
          let lynks = self.state.lynks
          lynks.push(lynk)
          self.setState({ lynks })
          db.collection('services').where('listingId', '==', lynk.serviceId).get().then((userDoc) => {
            if (!userDoc.empty) {
              let data = userDoc.docs[0].data()
              let services = newSelf.state.services
              services.push(data)
              newSelf.setState({ services })
              console.log('services', newSelf.state.services)
            }
          })
        })
      }
    })
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

  checkPaid(item) {
    let lynk = this.state.lynks.filter((lynk) => {
      return item.listingId === lynk.serviceId
    })
    if (lynk[0].sold && !lynk[0].awaitingPayment) {
      return 'Paid'
    } else {
      return 'Pay'
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
                      <Icon style={[styles.buyingIcon, styles.deleteIcon]} name="close" size={20} color="#0464F4"/>
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
                    <View style={styles.iconContainer}>
                      <Icon style={styles.buyingIcon} name="comment" size={20} color="#0464F4"/>
                    </View>
                    <Text style={[styles.iconLabelText, styles.chatIconText]}>Chat</Text>
                  </TouchableOpacity>
                </Row>
              </Col>
              <Col>
                <Row>
                  <TouchableOpacity
                    onPress={() => this.onPressBuy(item)}
                  >
                    <View style={styles.iconContainer}>
                      <Icon style={styles.buyingIcon} name="shopping-cart" size={20} color="#0464F4"/>
                    </View>
                    <Text style={[styles.iconLabelText, styles.buyIconText]}>{this.checkPaid(item)}</Text>
                  </TouchableOpacity>
                </Row>
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
      perspective: 'Buyer'
    })
  }

  onPressDelete(item) {
    // remove this lynk
    let db = firebase.firestore()
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
    this.props.navigation.navigate('Chat', {
      item,
      perspective: 'Buying',
      listingId: item.listingId,
      buyerIds: [this.state.currentUser.uid],
      sellerId: item.sellerId
    })
  }

  onPressBuy(item) {
    let lynk = this.state.lynks.filter((lynk) => {
      return item.listingId === lynk.serviceId
    })
    if (lynk[0].sold && !lynk[0].awaitingPayment) {
      return false
    }
    this.props.navigation.navigate('Checkout', {
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
          extraData={this.state}
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
            <Text style={appStyles.titleText}>Buying</Text>
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
    left: 10,
  },
  chatIconText: {
    position: 'relative',
    right: 0,
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
