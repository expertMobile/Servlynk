import React from 'react'
import { StyleSheet, Text, TextInput, View, Button, Image, TouchableOpacity } from 'react-native'
import firebase from 'firebase'
import appStyles from '@/AppStyles'
import { LinearGradient } from 'expo'
import SendBird from 'sendbird'

let icon = require('@/assets/images/Icon.png')
let logo = require('@/assets/images/ServLynk-2.png')

export default class Login extends React.Component {

  // state = { email: 'html5css3@outlook.com', password: 'Test23', errorMessage: null }
  state = { email: 'icando320@yahoo.com', password: 'mjh1990.11.30', errorMessage: null }
  // state = { email: '', password: '', errorMessage: null }

  handleLogin = () => {
    // const testDetails = { email: 'test@test.com', password: 'test12', errorMessage: null }
    // const testDetails = { email: 'html5css3@outlook.com', password: 'Test12', errorMessage: null }
    firebase
      .auth()
      // .signInWithEmailAndPassword(testDetails.email, testDetails.password)
      .signInWithEmailAndPassword(this.state.email, this.state.password)
      .then(() => {
        this.updateUserInfo();
        this.props.navigation.navigate('Services');
      })
      // .then(() => this.props.navigation.navigate('Buying'))
      .catch(error => this.setState({ errorMessage: error.message }))
  }

  updateUserInfo() {
    let emailAddress = this.state.email;
    let password = this.state.password;

    let db = firebase.firestore();
    let user = firebase.auth().currentUser;

    db.collection('users').where('userId', '==', user.uid)
      .get()
      .then((userDoc) => {
        userDoc.docs[0].ref.update({
          emailAddress,
          password,
          userId: user.uid
        });
      }, (error) => {

      });
  }

  render() {
    return (
      <View style={styles.container}>
        {/*<View style={styles.iconContainer}>
          <Image
            source={icon}
            style={styles.icon}
          />
        </View>*/}
        <View style={styles.logoContainer}>
          <Image
            source={logo}
            style={styles.logo}
          />
        </View>
        {this.state.errorMessage &&
          <Text style={{ color: 'red', position: 'relative', top: 70, width: 250 }}>
            {this.state.errorMessage}
          </Text>}
        <View style={styles.inputs}>
          <TextInput
            style={styles.textInput}
            autoCapitalize="none"
            placeholder="Email"
            onChangeText={email => this.setState({ email })}
            value={this.state.email}
            underlineColorAndroid='transparent'
          />
          <TextInput
            secureTextEntry
            style={styles.textInput}
            autoCapitalize="none"
            placeholder="Password"
            onChangeText={password => this.setState({ password })}
            value={this.state.password}
            underlineColorAndroid='transparent'
          />
        </View>

        <TouchableOpacity
          style={[appStyles.buttonContainer]}
          onPress={this.handleLogin}
        >
          <LinearGradient
            start={{x: 0, y: 0.75}} end={{x: 1, y: 0.25}}
            colors={['#0428CA', '#0464F4']}
            style={{ padding: 15, alignItems: 'center', width: 200, borderRadius: 10 }}>
            <Text style={appStyles.buttonText}>Login</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={[styles.message, appStyles.regularText]} onPress={() => this.props.navigation.navigate('SignUp')}>
          Don't have an account? Sign Up
        </Text>
        <Text style={[styles.messageTwo, appStyles.regularText]} onPress={() => this.props.navigation.navigate('ForgotPassword')}>
          I've forgotten my password! Reset it
        </Text>

      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  logoContainer: {
    position: 'absolute',
    top: 100,
    marginBottom: 40
  },
  logo: {
    width: 216,
    height: 48
  },
  message: {
    paddingTop: 40
  },
  messageTwo: {
    paddingTop: 10
  },
  textInput: {
    height: 40,
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
    marginTop: 20,
  },
  inputs: {
    width: 250,
    // marginLeft: '10%',
    marginTop: 80,
    marginBottom: 40
  }
})
