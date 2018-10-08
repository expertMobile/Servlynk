import './ReactotronConfig'
import React, { Component } from 'react'
import { View, AsyncStorage } from 'react-native';
import { AppLoading, Asset, Font } from 'expo'
import { createStackNavigator } from 'react-navigation'
// import CardStackStyleInterpolator from 'react-navigation/src/views/StackView/StackViewStyleInterpolator'
import imageCache from '@/data/imageCache'
import fontCache from '@/data/fontCache'
import Loading from '@/components/Loading'
import SignUp from '@/components/SignUp'
import Login from '@/components/Login'
import ForgotPassword from '@/components/ForgotPassword'
import Services from '@/components/Services'
import Buying from '@/components/Buying'
import Selling from '@/components/Selling'
import Profile from '@/components/Profile'
import CreateService from '@/components/CreateService'
import ViewService from '@/components/ViewService'
import Chat from '@/components/Chat'
import Checkout from '@/components/Checkout'
import ReceivePayment from '@/components/ReceivePayment'

const AppRoot = createStackNavigator(
  {
    Loading,
    SignUp,
    Login,
    ForgotPassword,
    Services,
    Buying,
    Selling,
    Profile,
    CreateService,
    ViewService,
    Chat,
    Checkout,
    ReceivePayment
  },
  {
    initialRouteName: 'Loading',
    headerMode: 'none',
    navigationOptions: {
      gesturesEnabled: true,
    },
    transitionConfig: () => ({

      screenInterpolator: sceneProps => {
        const { position, scene } = sceneProps

        const thisSceneIndex = scene.index

        const opacity = position.interpolate({
          inputRange: [thisSceneIndex - 1, thisSceneIndex],
          outputRange: [0, 1],
        })

        return { opacity }
      },
      // screenInterpolator: CardStackStyleInterpolator.forHorizontal,
    }),
  }
)

function cacheImages(images) {
  return images.map(image => {
    if (typeof image === 'string') {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
}

function cacheFonts(fonts) {
  return fonts.map(font => Font.loadAsync(font));
}

function clearAsync() {
  // let keys = [''];
  // return AsyncStorage.multiRemove(keys, (err) => {
  //   console.log('Cleared async')
  // });
}

export default class App extends React.Component {
  state = {
    isReady: false,
  }

  async _loadAssetsAsync() {
    const imageAssets = cacheImages(imageCache)
    const fontAssets = cacheFonts(fontCache)
    // const async = clearAsync();
    await Promise.all([...imageAssets, ...fontAssets])//, ...async]);
  }

  render() {
    if (!this.state.isReady) {
      return (
        <View>
        <AppLoading
          startAsync={this._loadAssetsAsync}
          onFinish={() => {
            return this.setState({ isReady: true })
          }}
          onError={console.warn}
        />
        </View>
      )
    }

    return <AppRoot/>
  }
}
