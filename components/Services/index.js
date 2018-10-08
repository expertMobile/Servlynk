import React, { Component } from 'react';
import {
  StyleSheet,
  Platform,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  TextInput
} from 'react-native';
import { LinearGradient } from 'expo'
import SideMenu from 'react-native-side-menu';
import Menu from '@/components/Menu'
import servicesData from '@/data/services'
import config from '@/data/config'
import appStyles from '@/AppStyles'
import Icon from 'react-native-vector-icons/MaterialIcons'

import SendBird from 'sendbird';
var sb = null;

const firebase = require('firebase');
require('firebase/firestore');

let image = require('@/assets/images/hamburger.png')

export default class Services extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.onPressService = this.onPressService.bind(this)
    this.onPressCreate = this.onPressCreate.bind(this)
    this.onSearch = this.onSearch.bind(this)

    this.state = {
      currentUser: null,
      isOpen: false,
      selectedItem: 'About',
      allServices: [],
      services: [],
      searchText: ''
    }
  }

  componentDidMount() {
    const { currentUser } = firebase.auth()
    this.setState({ currentUser })
    this.reloadList()

    sb = new SendBird({ appId: 'DCA62077-90AC-4AFC-95C7-29E3BA290359' })

    sb.connect(currentUser.uid, function (user, error) {
      if (error) {
        console.log(error)
        return
      }
      console.log('connected user to sendbird', user)
    })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.navigation.state.params.refresh) {
      this.reloadList()
    }
  }

  reloadList() {
    let db = firebase.firestore()
    var servicesData = []
    db.collection('services').get().then((subCollectionSnapshot) => {
      subCollectionSnapshot.forEach((doc) => {
        let service = doc.data();
        const { currentUser } = firebase.auth();
        if (currentUser.uid !== service.sellerId) {
          servicesData.push(service);
        }
      });
      this.setState({
        allServices: servicesData,
        services: servicesData
      });
    });
  }

  onPressCreate() {
    this.props.navigation.navigate('CreateService')
  }

  onPressService(item) {
    this.props.navigation.navigate('ViewService', {
      service: item,
      perspective: 'Buyer'
    })
  }

  onSearch(searchText) {
    const { allServices } = this.state;
    this.setState({ searchText });

    var services = [];

    if (searchText !== '') {
      allServices.forEach((service) => {
        if (service.listingTitle.toLowerCase().includes(searchText)) {
          services.push(service);
        }
      });
      this.setState({ services });
    } else {
      this.setState({ services: allServices });
    }
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  }

  updateMenuState(isOpen) {
    this.setState({ isOpen });
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

  getPrice(text) {
    return '$' + text.replace(/[^0-9-.]/g, '');
  }

  renderItem = ({ item }) => {
    return (
      <View style={styles.service}>
          <TouchableOpacity
            onPress={() => this.onPressService(item)}
          >
          <View>
            <Image
              style={styles.image}
              source={{ uri: item.imageOne }}
            />
          </View>
          <View>
            <Text style={[appStyles.regularText, styles.listingText]}>{item.listingTitle}</Text>
          </View>
          <View>
            <Text style={[appStyles.boldText, styles.listingPriceText]}>{this.getPrice(item.price)}</Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  render() {
    const { currentUser, services } = this.state
    const menu = <Menu onItemSelected={this.onMenuItemSelected} />;

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
            <Text style={appStyles.titleText}>Services</Text>
          </View>
          <TextInput
            placeholder="Search"
            style={styles.textSearch}
            onChangeText={searchText => this.onSearch(searchText.toLowerCase())}
            underlineColorAndroid='transparent'
          />
          <Icon style={styles.searchIcon} name="search" size={20} color="#0464F4"/>
          <View style={styles.list}>
            <FlatList
              style={styles.flatlist}
              data={services}
              showsHorizontalScrollIndicator={false}
              renderItem={this.renderItem}
              initialNumToRender={8}
              numColumns={2}
              keyExtractor={item => item.description}
            />
          </View>
          <TouchableOpacity
            style={[styles.confirmButton, appStyles.buttonContainer, appStyles.button]}
            onPress={this.onPressCreate}
          >
            <LinearGradient
              start={{x: 0, y: 0.75}} end={{x: 1, y: 0.25}}
              colors={['#0428CA', '#0464F4']}
              style={{ padding: 15, alignItems: 'center', width: 300, borderRadius: 10 }}>
              <Text style={appStyles.buttonText}>Create listing</Text>
            </LinearGradient>
          </TouchableOpacity>
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
  textSearch: {
    borderRadius: 10,
    borderWidth: 1,
    width: '70%',
    position: 'absolute',
    top: 80,
    padding: 5,
    paddingLeft: 30,
    textAlign: 'left'
  },
  searchIcon: {
    position: 'absolute',
    top: 84,
    padding: 5,
    left: 60
  },
  list: {
    position: 'absolute',
    width: listWidth,
    height: Dimensions.get('window').height - 200,
    top: 120,
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
  error: {
    position: 'absolute',
    top: 30
  }
});
