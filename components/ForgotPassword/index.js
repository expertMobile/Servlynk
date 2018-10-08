import React from 'react'
import { StyleSheet, Text, TextInput, View, Button, Image, TouchableOpacity } from 'react-native'
import appStyles from '@/AppStyles'
import { LinearGradient } from 'expo'

let icon = require('@/assets/images/Icon.png')
let logo = require('@/assets/images/ServLynk-2.png')

let forgotPassword = `https://us-central1-serv-lynk.cloudfunctions.net/api4/forgot-password`

const firebase = require('firebase');
require('firebase/firestore');

export default class ForgotPassword extends React.Component {

  state = { email: 'icando320@yandex.com', errorMessage: null }

  async sendEmail(password) {
    console.log('Email: ', this.state.email);
    console.log('Password: ', password);
    const res = await fetch(forgotPassword, {
      method: 'POST',
      body: JSON.stringify({ emailAddress: this.state.email, existingPassword: password }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    }).catch(function(error) {
      console.error('Error sending email: ', error);
    });
  }

  handleForgotPassword = () => {
    let auth = firebase.auth();
    let db = firebase.firestore();

    db.collection('users').where('emailAddress', '==', this.state.email).get().then((userDoc) => {
      if (!userDoc.empty) {
        auth.sendPasswordResetEmail(this.state.email).then({
          
        })
        .catch((error) => {
          console.error('Error sending email: ', error);
        });
      } else {
        this.setState({ errorMessage: 'Email address not found' });
      }
    });
  }

  render() {
    return (
      <View style={styles.container}>
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
            placeholder="Email address"
            autoCapitalize="none"
            style={styles.textInput}
            onChangeText={email => this.setState({ email })}
            underlineColorAndroid='transparent'
          />
        </View>

        <TouchableOpacity
          style={[styles.signup, appStyles.buttonContainer]}
          onPress={this.handleForgotPassword}
        >
          <LinearGradient
            start={{x: 0, y: 0.75}} end={{x: 1, y: 0.25}}
            colors={['#0428CA', '#0464F4']}
            style={{ padding: 15, alignItems: 'center', width: 200, borderRadius: 10 }}>
            <Text style={appStyles.buttonText}>Submit</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={[styles.message, appStyles.regularText]} onPress={() => this.props.navigation.navigate('Login')}>
          Already have an account? Login
        </Text>
        <Text style={[styles.messageTwo, appStyles.regularText]} onPress={() => this.props.navigation.navigate('SignUp')}>
          Don't have an account? Sign Up
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
    top: 130
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
    marginTop: 80,
    marginBottom: 40
  }
})
