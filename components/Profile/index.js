import React, { Component } from 'react';
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
} from 'react-native';
import SideMenu from 'react-native-side-menu';
import Menu from '@/components/Menu'
import servicesData from '@/data/services'
import config from '@/data/config'
import appStyles from '@/AppStyles'
import { LinearGradient } from 'expo'

const firebase = require('firebase');
require('firebase/firestore');

let image = require('@/assets/images/hamburger.png')

export default class Profile extends Component {
  constructor(props) {
    super(props)

    this.toggle = this.toggle.bind(this)

    this.state = {
      currentUser: null,
      firstName: '',
      surname: '',
      emailAddress: '',
      location: '',
      password: '',
      confirmPassword: '',
      errorMessage: ''
    }
    this.handleSave = this.handleSave.bind(this)
  }

  componentDidMount() {
    if (config.offline) {
      this.setState({ profile: 'servicesData' })
    } else {
      const { currentUser } = firebase.auth()
      this.setState({ currentUser })
      this.setState({ emailAddress: currentUser.email })

      // Check if user exists to get exisitng details
      let db = firebase.firestore()

      db.collection('users').where('userId', '==', currentUser.uid).get().then((userDoc) => {
        if (!userDoc.empty) {
          // userDoc.docs[0].ref
          let data = userDoc.docs[0].data()
          this.setState({
            firstName: data.firstName,
            surname: data.surname,
            emailAddress: data.emailAddress,
            location: data.location
          })
        }
      })
    }
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen,
    });
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

  handleSave() {
    const { firstName, surname, emailAddress, location, password, confirmPassword } = this.state;

    if (firstName.length == 0) {
      this.setState({ errorMessage: 'Please enter first name.' });
      return;
    }
    if (surname.length == 0) {
      this.setState({ errorMessage: 'Please enter surname.' });
      return;
    }
    if (emailAddress.length == 0) {
      this.setState({ errorMessage: 'Please enter email address.' });
      return;
    }
    if (location.length == 0) {
      this.setState({ errorMessage: 'Please enter location.' });
      return;
    }

    if (password.length > 0 || confirmPassword.length > 0) {
      if (password.length < 6) {
        this.setState({ errorMessage: 'Password must be at least 6 characters' })
        return
      }

      if (password !== confirmPassword) {
        this.setState({ errorMessage: 'Passwords do not match' })
        return
      }
    }

    // Passed validation

    let db = firebase.firestore()
    let user = firebase.auth().currentUser;

    user.updatePassword(password).then(() => {
      console.log('Updated password')
    }, (error) => {
      console.log('Update password error')
    })

    // Check if user exists, if so update, if not create

    db.collection('users').where('userId', '==', user.uid).get().then((userDoc) => {

      if (userDoc.empty) {
        // User not saved yet

        db.collection('users').add({
          firstName, surname, emailAddress, location, userId: user.uid
        }).then(() => {
          console.log('Added user to collection')
          this.props.navigation.navigate('Services')
        }, (error) => {
          console.log('Add user error')
        })
      } else {
        // Update saved user

        userDoc.docs[0].ref.update({
          firstName, surname, emailAddress, password, location, userId: user.uid, stripeId: ''
        }).then(() => {
          console.log('Updated user')
          this.props.navigation.navigate('Services')
        }, (error) => {
          console.log('Update user error')
        })
      }

    }, (error) => {

    })
  }

  render() {
    const { currentUser } = this.state
    const menu = <Menu onItemSelected={this.onMenuItemSelected}/>;

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
            <Text style={appStyles.titleText}>Profile</Text>
          </View>
          <View style={styles.error}>
            <Text style={{color: 'red'}}>
                {!!this.state.errorMessage && this.state.errorMessage}
            </Text>
          </View>
          <View style={appStyles.textInputContainer}>
            <TextInput
              placeholder="First name"
              style={appStyles.textInput}
              onChangeText={firstName => this.setState({ firstName })}
              value={this.state.firstName}
              underlineColorAndroid='transparent'
            />
          </View>
          <View style={appStyles.textInputContainer}>
            <TextInput
              placeholder="Surname"
              style={appStyles.textInput}
              onChangeText={surname => this.setState({ surname })}
              value={this.state.surname}
              underlineColorAndroid='transparent'
            />
          </View>
          <View style={appStyles.textInputContainer}>
            <TextInput
              placeholder="Email address"
              style={appStyles.textInput}
              onChangeText={emailAddress => this.setState({ emailAddress })}
              value={this.state.emailAddress}
              underlineColorAndroid='transparent'
            />
          </View>
          <View style={appStyles.textInputContainer}>
            <TextInput
              placeholder="Location"
              style={appStyles.textInput}
              onChangeText={location => this.setState({ location })}
              value={this.state.location}
              underlineColorAndroid='transparent'
            />
          </View>
          <View style={appStyles.textInputContainer}>
            <TextInput
              placeholder="New password"
              style={appStyles.textInput}
              onChangeText={password => this.setState({ password })}
              value={this.state.password}
              underlineColorAndroid='transparent'
            />
          </View>
          <View style={appStyles.textInputContainer}>
            <TextInput
            placeholder="Confirm password"
            style={appStyles.textInput}
            onChangeText={confirmPassword => this.setState({ confirmPassword })}
            value={this.state.confirmPassword}
            underlineColorAndroid='transparent'
            />
          </View>
          <TouchableOpacity
            onPress={this.handleSave}
            style={appStyles.button}
          >
            <LinearGradient
              start={{x: 0, y: 0.75}} end={{x: 1, y: 0.25}}
              colors={['#0428CA', '#0464F4']}
              style={{ padding: 15, alignItems: 'center', width: 300, borderRadius: 10 }}>
              <Text style={appStyles.buttonText}>Save</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
});
