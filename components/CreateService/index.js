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
  Button,
  TextInput,
  Dimensions
} from 'react-native'
import SideMenu from 'react-native-side-menu'
import Menu from '@/components/Menu'
import servicesData from '@/data/services'
import config from '@/data/config'
import appStyles from '@/AppStyles'
import ListPopover from 'react-native-list-popover'
import uuid from 'uuid'
import { Col, Row, Grid } from "react-native-easy-grid"
import DropdownMenu from '../Dropdown';

import { Constants, ImagePicker, Permissions, ImageManipulator, LinearGradient } from 'expo'

const firebase = require('firebase')
require('firebase/firestore')

let image = require('@/assets/images/hamburger.png')

const options = {
  allowsEditing: true,
}

const categoryOptions = [
  'Accounting',
  'Arts/Crafts',
  'Automotive',
  'Carpentry & Construction',
  'Cleaning',
  'Computer Help',
  'Cooking/Baking',
  'Data Entry',
  'Decoration',
  'Deep Clean',
  'Delivery',
  'Electrician',
  'Event Planning',
  'Event Staffing',
  'Furniture Assembly',
  'Graphic Design',
  'Heavy Lifting',
  'Laundry and Ironing',
  'Marketing',
  'Minor Home Repairs',
  'Moving Help',
  'Office Administration',
  'Organization',
  'Packing & Shipping',
  'Painting',
  'Personal Assistant',
  'Pet Sitting',
  'Photography',
  'Plumbing',
  'Research',
  'Sewing',
  'Shopping',
  'Videography',
  'Waiting in Line',
  'Yard Work & Removal'
]

export default class CreateService extends Component {
  constructor(props) {
    super(props)

    this.state = {
      errorMessage: '',
      currentUser: null,
      categoryOptionsVisible: false,
      listingId: '',
      category: 'Select category',
      listingTitle: '',
      price: '',
      description: '',
      location: '',
      selectedPhotoOne: '',
      selectedPhotoTwo: '',
      selectedPhotoThree: '',
      imageUriOne: '',
      imageUriTwo: '',
      imageUriThree: ''
    }

    this.toggle = this.toggle.bind(this);
    this.setPrice = this.setPrice.bind(this)
    this.handleSave = this.handleSave.bind(this)
    this.selectPhoto = this.selectPhoto.bind(this)
  }

  componentDidMount() {
    if (config.offline) {
      this.setState({ profile: 'servicesData' })
    } else {
      const { currentUser } = firebase.auth()
      this.setState({ currentUser })

      // Get user location

      let db = firebase.firestore()

      db.collection('users').where('userId', '==', currentUser.uid).get().then((userDoc) => {
        if (!userDoc.empty) {
          let data = userDoc.docs[0].data()
          this.setState({
            location: data.location
          })
        }
      })
    }
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

  setPrice(text) {
    let newText = text.replace(/[^0-9-.]/g, '');
    const price = '$' + newText;
    this.setState({ price })
  }

  getPermission = async(permission) => {
    let { status } = await Permissions.askAsync(permission)
    if (status !== 'granted') {
      // Linking.openURL('app-settings:')
      return false
    }
    return true
  }

  selectPhoto = async(photoNumber) => {
    // let uri = `file:///Users/v8/Library/Developer/CoreSimulator/Devices/47168DEE-6E53-43AB-9C87-B69BD33BD425/data/Containers/Data/Application/41FC90DA-5236-4B72-83C4-08484D73EDE8/Library/Caches/ExponentExperienceData/%2540anonymous%252Fservlynk-482798c4-8b13-4850-8953-c1808c85eddc/ImagePicker/C4ECFA25-CD06-4A31-9CCA-A73B8ED999D1.jpg`

    // switch (photoNumber) {
    //   case 1:
    //     this.setState({ selectedPhotoOne: uri })
    //     break
    //   case 2:
    //     this.setState({ selectedPhotoTwo: uri })
    //     break
    //   case 3:
    //     this.setState({ selectedPhotoThree: uri })
    //     break
    // }

    const status = await this.getPermission(Permissions.CAMERA_ROLL)

    if (status) {
      const result = await ImagePicker.launchImageLibraryAsync(options)
      if (!result.cancelled) {
        switch (photoNumber) {
          case 1:
            this.setState({ selectedPhotoOne: result.uri })
            break
          case 2:
            this.setState({ selectedPhotoTwo: result.uri })
            break
          case 3:
            this.setState({ selectedPhotoThree: result.uri })
            break
        }
      }
    }
  }

  // takePhoto = async() => {
  //   const status = await this.getPermission(Permissions.CAMERA)
  //   if (status) {
  //     const result = await ImagePicker.launchCameraAsync(options)
  //     if (!result.cancelled) {
  //       this.props.navigation.navigate('NewPost', { image: result.uri })
  //     }
  //   }
  // }

  handleSave() {
    const {
      category,
      listingTitle,
      price,
      description,
      location,
      selectedPhotoOne,
      selectedPhotoTwo,
      selectedPhotoThree
    } = this.state;

    if (category === '') {
      this.setState({ errorMessage: 'Category must be selected' });
      return;
    }
    if (listingTitle === '') {
      this.setState({ errorMessage: 'Give your listing a title' });
      return;
    }
    if (price === '') {
      this.setState({ errorMessage: 'Give your listing a price' });
      return;
    }
    if (description === '') {
      this.setState({ errorMessage: 'Give your listing a description' });
      return;
    }

    if (selectedPhotoOne === '' && selectedPhotoTwo === '' &&
      selectedPhotoThree === '') {
      this.setState({ errorMessage: 'Select one photo' });
      return;
    }

    // Passed validation

    let self = this
    let listingId = uuid()

    this.setState({
      photosPosted: 0,
      listingId
    })

    if (selectedPhotoOne !== '') {
      self.post(selectedPhotoOne, 1)
    }
    if (selectedPhotoOne !== '' && selectedPhotoTwo !== '') {
      self.post(selectedPhotoTwo, 2)
    } else {
      this.setState({ errorMessage: 'Select first photo' });
      return;
    }
    if (selectedPhotoOne !== '' && selectedPhotoTwo !== '' && selectedPhotoThree !== '') {
      self.post(selectedPhotoThree, 3)
    } else {
      this.setState({ errorMessage: 'Select first & second photo' });
      return;
    }

  }

  post = async(localUri, imageNumber) => {
    try {
      const { uri: reducedImage, width, height } = await this.reduceImageAsync(
        localUri,
      )
      const remoteUri = await this.uploadPhotoAsync(reducedImage, imageNumber)

      switch (imageNumber) {
        case 1:
          this.setState({ imageUriOne: remoteUri });
          break;
        case 2:
          this.setState({ imageUriTwo: remoteUri });
          break;
        case 3:
          this.setState({ imageUriThree: remoteUri });
          break;
      }

      this.setState({ photosPosted: this.state.photosPosted+1 })

      // if (this.state.photosPosted === 3) {
        // let user = firebase.auth().currentUser
        let db = firebase.firestore()
        let self = this
        const { currentUser } = firebase.auth()

        const { category, listingId, listingTitle, price, description, location,
          imageUriOne, imageUriTwo, imageUriThree } = this.state

        db.collection('services').add({
          category,
          description,
          listingId,
          listingTitle,
          location,
          price: price.replace(/$/, ''),
          sellerId: currentUser.uid,
          imageOne: this.state.imageUriOne,
          imageTwo: this.state.imageUriTwo,
          imageThree: this.state.imageUriThree
        })
        .then(function(docRef) {
          console.log('Document written with ID: ', docRef.id)
          self.props.navigation.navigate('Selling', { refresh: true })
        })
        .catch(function(error) {
          console.error('Error adding document: ', error)
        })
      // }
    } catch ({ message }) {
      alert(message)
    }
  }

  reduceImageAsync(uri) {
    return ImageManipulator.manipulate(uri, [{ resize: { width: 500 } }], {
      compress: 0.5,
    })
  }

  uploadPhoto(uri, uploadUri) {
    return new Promise(async(res, rej) => {
      const response = await fetch(uri)
      const blob = await response.blob()

      const ref = firebase.storage().ref(uploadUri)
      const unsubscribe = ref.put(blob).on(
        'state_changed',
        state => {},
        err => {
          unsubscribe()
          rej(err)
        },
        async() => {
          unsubscribe()
          const url = await ref.getDownloadURL()
          res(url)
        },
      )
    })
  }

  uploadPhotoAsync = async(uri, imageNumber) => {
    const path = `services/${this.state.listingId}/${imageNumber}.jpg`
    return this.uploadPhoto(uri, path)
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  }

  render() {
    const { currentUser, selectedPhotoOne, selectedPhotoTwo, selectedPhotoThree } = this.state
    const menu = <Menu onItemSelected={this.onMenuItemSelected}/>

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
            <View style={appStyles.title}>
              <Text style={appStyles.titleText}>Select category</Text>
            </View>
            <View style={styles.createService}>
              <View style={styles.error}>
                <Text style={{color: 'red'}}>
                    {!!this.state.errorMessage && this.state.errorMessage}
                </Text>
              </View>
              <View style={styles.selectCategory}>
                <DropdownMenu
                  bgColor={'white'}
                  tintColor={'#666666'}
                  activityTintColor={'#0464F4'}
                  optionTextStyle={{color: '#333333'}}
                  titleStyle={{color: '#333333'}}
                  maxHeight={300}
                  handler={(selection, row) => {
                    // console.log(('test'));
                    return this.setState({category: [categoryOptions][selection][row]})
                  }}
                  data={[categoryOptions]}
                />
              </View>
              <View style={styles.inputGroup}>
                <View style={styles.textInputContainer}>
                  <TextInput
                    placeholder="Listing title"
                    style={appStyles.textInput}
                    onChangeText={listingTitle => this.setState({ listingTitle })}
                    value={this.state.listingTitle}
                    underlineColorAndroid='transparent'
                  />
                </View>
                <View style={styles.textInputWrapper}>
                  <TextInput
                    placeholder="Price"
                    style={[appStyles.textInput, styles.price]}
                    keyboardType='number-pad'
                    onChangeText={text => this.setPrice(text)}
                    value={this.state.price}
                    underlineColorAndroid='transparent'
                  />
                </View>
                <View style={styles.textInputContainer}>
                  <TextInput
                    multiline={true}
                    numberOfLines={4}
                    placeholder="Detailed description"
                    style={[appStyles.textInput, styles.textArea]}
                    onChangeText={description => this.setState({ description })}
                    value={this.state.description}
                    underlineColorAndroid='transparent'
                  />
                </View>
                <View style={styles.textInputContainer}>
                  <TextInput
                    placeholder="Location"
                    style={appStyles.textInput}
                    onChangeText={location => this.setState({ location })}
                    value={this.state.location}
                    underlineColorAndroid='transparent'
                  />
                </View>
                <View style={[appStyles.row, styles.images]}>
                  <TouchableOpacity
                    style={[styles.photoContainer]}
                    onPress={() => this.selectPhoto(1)}
                  >
                    <View style={[styles.textInput]}>
                      {this.state.selectedPhotoOne !== '' ?
                        <Image
                          source={{ uri: this.state.selectedPhotoOne}}
                          style={styles.photo}
                        />
                      :
                        <Text style={styles.photoText}>Select</Text>
                      }
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.photoContainer]}
                    onPress={() => this.selectPhoto(2)}
                  >
                    <View style={[styles.textInput]}>
                      {this.state.selectedPhotoTwo !== '' ?
                        <Image
                          source={{ uri: this.state.selectedPhotoTwo}}
                          style={styles.photo}
                        />
                      :
                        <Text style={styles.photoText}>Select</Text>
                      }
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.photoContainer]}
                    onPress={() => this.selectPhoto(3)}
                  >
                    <View style={[styles.textInput]}>
                      {this.state.selectedPhotoThree !== '' ?
                        <Image
                          source={{ uri: this.state.selectedPhotoThree}}
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
            <TouchableOpacity
              style={[appStyles.buttonContainer, appStyles.button]}
              onPress={this.handleSave}
            >
              <LinearGradient
                start={{x: 0, y: 0.75}} end={{x: 1, y: 0.25}}
                colors={(selectedPhotoOne !== '' || selectedPhotoTwo !== '' || selectedPhotoThree !== '') ? ['#0428CA', '#0464F4'] : ['gray', '#cecece']}
                style={{ padding: 15, alignItems: 'center', width: 300, borderRadius: 10 }}
              >
                <Text style={appStyles.buttonText}>Post listing</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </SideMenu>
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
  createService: {
    width: '70%',
    position: 'absolute',
    top: 90,
    left: '0%'
  },
  categoryListContainer: {
    flex: 1,
    position: 'absolute',
    top: 95,
    left: '0%',
    width: '100%',
    height: 80,
  },
  selectCategory: {
    position: 'relative',
    top: 20,
    left: 25,
    width: '120%',
    padding: 10,
    zIndex: 1
  },
  popoverTextStyle: {
    zIndex: 3,
    backgroundColor: '#fff',
    fontSize: 16,
    paddingLeft: 30,
    paddingRight: 30,
    paddingTop: 10,
    paddingBottom: 10,
    textAlign: 'center',
    borderBottomWidth: 0
  },
  inputGroup: {
    position: 'absolute',
    top: 80
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
  textInputWrapper: {
    width: Dimensions.get("window").width * 0.8,
    marginVertical: 10,
    marginHorizontal: Dimensions.get("window").width * 0.1
  },
  textInput: {
    width: '80%',
    margin: 5,
  },
  price: {
    width: 100,
  },
  textArea: {
    height: 100,
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 10,
    flex: 1,
    padding: 5
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
  textInputContainer: {
    alignItems: 'center',
  },
  photoContainer: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#eee',
    borderRadius: 3,
    margin: 4
  },
  photo: {
    width: 85,
    height: 85,
    margin: 2
  },
  error: {
    position: 'absolute',
    top: 0,
    width: 200,
    left: (Dimensions.get('window').width / 2) - 100
  }
})
