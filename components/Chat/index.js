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
  TextInput,
  Dimensions
} from 'react-native'
import SideMenu from 'react-native-side-menu'
import Menu from '@/components/Menu'
import config from '@/data/config'
import appStyles from '@/AppStyles'
import { Constants, Permissions, LinearGradient } from 'expo'
import Icon from 'react-native-vector-icons/MaterialIcons'

import SendBird from 'sendbird'
var sb = null

const firebase = require('firebase')
require('firebase/firestore')

let image = require('@/assets/images/hamburger.png')

export default class Chat extends Component {
  constructor(props) {
    super(props)

    this.toggle = this.toggle.bind(this)
    this.onPressSend = this.onPressSend.bind(this)
    this.processMessage = this.processMessage.bind(this)
    this.onPressBuyer = this.onPressBuyer.bind(this)

    this.state = {
      currentUser: null,
      isOpen: false,
      perspective: '',
      listingId: '',
      listingTitle: '',
      messages: [],
      currentMessage: '',
      buyer: {},
      buyerUsers: [],
      seller: {},
      selectedBuyer: false,
      buyerId: 'null'
    }
  }

  componentDidMount() {
    const { currentUser } = firebase.auth()
    this.setState({ currentUser })

    let db = firebase.firestore()

    const { buyerIds, sellerId, perspective, item } = this.props.navigation.state.params

    this.setState({
      perspective,
      listingId:item.listingId,
      listingTitle: item.listingTitle,
      sellerId
    })

    // get users

    if (perspective === 'Buying') {
      db.collection('users').where('userId', '==', buyerIds[0]).get().then((userDoc) => {
        if (!userDoc.empty) {
          let data = userDoc.docs[0].data()
          this.setState({ buyer: data, buyerId: data.id, selectedBuyer: true })
          this.createChatChannel(data.id)
        }
      })
    } else {
      // from the sellers perspective, we have the sellerId
      // and an array of buyerIds instead of just one, these
      // buyers are shown in a buyer selector to switch channels

      buyerIds.forEach((buyerId) => {
        db.collection('users').where('userId', '==', buyerId).get().then((buyerDocs) => {
          buyerDocs.forEach((doc) => {
            let buyerUser = doc.data()
            let buyerUsers = this.state.buyerUsers
            buyerUsers.push(buyerUser)
            console.log(doc.data());
            this.setState({ buyerUsers })
            this.forceUpdate()
          })
        })
      })
    }

    db.collection('users').where('userId', '==', sellerId).get().then((userDoc) => {
      if (!userDoc.empty) {
        let data = userDoc.docs[0].data()
        this.setState({ seller: data })
      }
    })
  }

  createChatChannel(buyerId) {
    // connect to sendbird channel

    sb = SendBird.getInstance()

    let sbird = sb

    let userIds = [this.state.sellerId, buyerId]
    let self = this
    let buyerid = buyerId

    sb.GroupChannel.createChannelWithUserIds(userIds, true, userIds.join(), '', '', '', function(createdChannel, error) {
      if (error) {
        console.error(error)
        return
      }

      self.setState({ channel: createdChannel })
      console.log('channel found:', createdChannel)

      // load previous messages
      var messageListQuery = createdChannel.createPreviousMessageListQuery()

      let self2 = self
      let buyerId2 = buyerid

      messageListQuery.load(200, true, (messageList, error) => {
        if (error) {
          console.error('couldnt load previous messages', error)
          return
        }
        console.log('found previous messages', messageList)

        let process = self2.processMessage

        for (let i = 0; i < messageList.length; i++) {
          process(messageList[i], buyerId2)
        }
      })

      // received message
      var ChannelHandler = new sbird.ChannelHandler()

      ChannelHandler.onMessageReceived = (channel, message) => {
        console.log('message received', channel, message)
        self2.processMessage(message)
      }

      sbird.addChannelHandler('ChatView', ChannelHandler)
    })
  }

  updateList(messages) {
    this.setState({ messages })
    // function(){ console.log("force update") })
    // self.forceUpdate() )
  }

  processMessage(message, buyerId) {
    let self = this
    try {
      let data = JSON.parse(message.data)

      let messages = self.state.messages

      if (data.listingId === self.state.listingId) {
        messages.unshift({
          id: message.messageId,
          text: message.message,
          listingId: data.listingId,
          buyer: data.sender === self.state.currentUser.uid
        })
        self.updateList(messages)
      }

    } catch (e) {
      return false;
    }
    return true;
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
    this.setState({
      isOpen: false,
      selectedItem: item,
    })
    this.props.navigation.navigate(item)
  }

  renderItem = ({ item }) => {
    if (item.text === '') {
      return;
    }
    switch(item.buyer) {
      case true:
        return (
          <View style={[styles.buyer, styles.messageContainer]}>
            <View>
              <Text style={[appStyles.regularText, styles.message]}>{item.text}</Text>
            </View>
          </View>
        )
        break
      case false:
        return (
          <View style={[styles.seller, styles.messageContainer]}>
            <View>
              <Text style={[appStyles.regularText, styles.message]}>{item.text}</Text>
            </View>
          </View>
        )
        break
    }
  }

  onPressSend() {
    if (this.state.currentMessage === '') {
      return;
    }
    let self = this
    let messageData = `{ "sender": "${this.state.currentUser.uid}", "listingId": "${this.state.listingId}" }`
    this.state.channel.sendUserMessage(this.state.currentMessage, messageData, '', function(message, error){
      if (error) {
        console.error('error sending message', error)
        return
      } else {
        self.setState({ currentMessage: '' })
        let messages = self.state.messages
        messages.push({
          id: message.messageId,
          text: message.message,
          buyer: self.state.perspective==='Buying'
        })
        self.setState({ messages })
        self.forceUpdate()
        console.log('sent message', message)
      }
    })
  }

  onPressBuyer(buyerUser) {
    this.setState({
      messages: [],
      selectedBuyer: true
    })
    this.createChatChannel(buyerUser.userId)
  }

  renderBuyerSelectorTitle() {
    if (!this.state.selectedBuyer) {
      return (
        <View style={styles.buyerSelectorTitle}>
          <Text style={[appStyles.regularText, styles.buyerSelectorTitleText]}>Messages</Text>
        </View>
      )
    }
  }

  renderBuyerSelector() {
    if (!this.state.selectedBuyer) {
      return this.state.buyerUsers.map((user) => {
        let buyerName = `${user.firstName} ${user.surname}`
        return (
          <View style={styles.buyerSelectorItemContainer} key={user.userId}>
            <TouchableOpacity
              onPress={() => this.onPressBuyer(user)}
              style={styles.buyerSelectorItem}
            >
              <View style={appStyles.row}>
                <View style={appStyles.column}>
                  <Icon style={styles.userIcon} name="person" size={20} color="#0464F4"/>
                </View>
                <View style={appStyles.column}>
                  <Text style={styles.buyerSelectorText}>{buyerName}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )
      })
    }
  }

  renderMessages() {
    if (this.state.messages.length > 0 && this.state.selectedBuyer) {
      return (
        <View>
          <FlatList
            style={styles.flatlist}
            data={this.state.messages}
            showsHorizontalScrollIndicator={false}
            renderItem={this.renderItem}
            initialNumToRender={8}
            numColumns={1}
            ref={ref => this.flatList = ref}
            onContentSizeChange={() => this.flatList.scrollToEnd({animated: true})}
            onLayout={() => this.flatList.scrollToEnd({animated: true})}
            extraData={this.state}
            keyExtractor={item => item.id.toString()}
          />
        </View>
      )
    } else {
      return <View/>
    }
  }

  renderChat() {
    if (!this.state.selectedBuyer) {
      return (
        <View>
          <View style={styles.buyerSelectorTitleContainer}>
            {this.renderBuyerSelectorTitle()}
          </View>
          <View style={styles.buyerSelectorContainer}>
            {this.renderBuyerSelector()}
          </View>
        </View>
      )
    } else {
      return (
        <View>
          {this.renderMessages()}
        </View>
      )
    }
  }

  renderSendMessageRow() {
    if (this.state.selectedBuyer) {
      return (
        <View style={[appStyles.row]}>
          <View style={[styles.chatInput, appStyles.column]}><TextInput
            placeholder="Enter message"
            style={appStyles.textInput}
            onChangeText={currentMessage => this.setState({ currentMessage })}
            value={this.state.currentMessage}/>
          </View>
          <View style={appStyles.column}>
            <TouchableOpacity
              style={[styles.sendButton]}
              onPress={this.onPressSend}
            >
             <Icon style={styles.sendIcon} name="send" size={20} color="#0464F4"/>
            </TouchableOpacity>
          </View>
        </View>
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
            <Text style={appStyles.titleText}>{`${this.state.perspective}\n${this.state.listingTitle}`}</Text>
          </View>
          <View style={styles.list}>
            {this.renderChat()}
          </View>
          <View style={styles.chatRow}>
            {this.renderSendMessageRow()}
          </View>
        </View>
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
  title: {
    position: 'relative',
    bottom: 10,
  },
  list: {
    position: 'absolute',
    width: listWidth,
    height: Dimensions.get('window').height - 250,
    top: 130,
  },
  flatlist: {
    flexDirection: 'column',
  },
  chatInput: {
    width: 200,
    position: 'absolute',
    bottom: 10,
    left: -120
  },
  chatRow: {
    position: 'absolute',
    bottom: 30
  },
  sendButton: {
    position: 'absolute',
    top: -25,
    left: 100
  },
  messageContainer: {
    padding: 10,
    borderRadius: 5,
    margin: 10
  },
  buyer: {
    width: '80%',
    backgroundColor: '#a3eaff',
  },
  seller: {
    width: '80%',
    marginLeft: 50,
    backgroundColor: '#6db8ff'
  },
  buyerSelectorItem: {
    // backgroundColor: '#0428CA',
    // borderRadius: 15,
    // height: 40,
    // width: 200,
    // marginBottom: 5,
    // padding: 10
  },
  buyerSelectorItemContainer: {
    // height: 30,
    // marginTop: 10
  },
  buyerSelectorTitleText: {
    fontWeight: '200',
    fontSize: 18
  },
  buyerSelectorText: {
    // color: '#fff',
    // color: '#000',
    // fontWeight: '200',
    // fontSize: 16
    position: 'relative',
    right: 100
  },
  buyerSelectorContainer: {
    // position: 'absolute',
    // top: 30
    marginTop: 30
  },
  buyerSelectorTitleContainer: {
    // height: 40,
    position: 'absolute',
    top: 0
  },
  userIcon: {
    color: "#0464F4",
    opacity: 0.8,
  },
  sendIcon: {
    color: "#0464F4",
    opacity: 0.8,
  }
})
