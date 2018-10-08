// Loading.js
import React from 'react'
import { View, Text, StyleSheet, ActivityIndicator, AppState, Platform } from 'react-native'
import { Permissions, Notifications } from 'expo'
import appStyles from '@/AppStyles'
import config from '@/data/config'
import SendBird from 'sendbird'

const firebase = require('firebase')
require('firebase/firestore')

export default class Loading extends React.Component {

  state = {
    notification: {},
  };

  componentDidMount() {
    if (config.offline) {
      // this.props.navigation.navigate('Services')
    } else {
      firebase.initializeApp({
        apiKey: 'AIzaSyAmDl-QOhL8nJP7lbmi9RRkkiKny10PcBQ',
        authDomain: 'serv-lynk.firebaseapp.com',
        databaseURL: 'https://serv-lynk.firebaseio.com',
        projectId: `serv-lynk`,
        storageBucket: 'serv-lynk.appspot.com',
        messagingSenderId: '12103130614'
      })

      firebase.firestore().settings({ timestampsInSnapshots: true })

      // sb = new SendBird({ appId: 'DCA62077-90AC-4AFC-95C7-29E3BA290359' })

      this.registerForPushNotificationsAsync();

      // firebase.auth().onAuthStateChanged(async user => {
       this.props.navigation.navigate('Login')
       // this.props.navigation.navigate(user ? 'SignUp' : 'Login')
        console.log('Firebase auth changed')
      // })

      this._notificationSubscription = Notifications.addListener(this._handleNotification);
    }
  }

  async registerForPushNotificationsAsync() {
    const { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    );
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return;
    }

    let token = await Notifications.getExpoPushTokenAsync();
    console.log('TOKEN: ', token);
    const sb = new SendBird({ appId: 'DCA62077-90AC-4AFC-95C7-29E3BA290359' });
    console.log('Sendbird: ', sb);
    if(sb) {
      if(Platform.OS === 'ios') {
        sb.registerAPNSPushTokenForCurrentUser(token, function(response, error) {
          if (error) {
            console.error(error);
            return;
          }

          // Do something in response to a successful registeration.
        });
      } else {
        sb.registerGCMPushTokenForCurrentUser(token, function(response, error) {
          if (error) {
            console.error(error);
            return;
          }

          console.log('Response: ', response);
        });
      }
    }
  }

  _handleNotification = (notification) => {
    this.setState({notification: notification});

    try {
      const data = JSON.parse(notification.sendbird);
      Notifications.presentLocalNotificationAsync({
        title: data.sender ? data.sender.name : 'SendBird',
        body: data.message,
        android: {
          priority: 'max',
          vibrate: [0, 250, 250, 250],
          color: '#FF0000',
        },
      });
    } catch(e) {

    }

    Notifications.presentLocalNotificationAsync({
      title: 'Reminder',
      body: 'This is an important reminder!!!!',
      android: {
        priority: 'max',
        vibrate: [0, 250, 250, 250],
        color: '#FF0000',
      },
    });
  };

  render() {
    return (
      <View style={{position: 'relative', top: 300}}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
})
