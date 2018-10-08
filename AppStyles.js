import { StyleSheet, Dimensions } from 'react-native'

export default StyleSheet.create({
  mainContainer: {
    flex: 1,
    zIndex: 0
  },
  viewContainer: {
    position: 'absolute',
    top: 20,
  },
  row: {
    flexDirection: 'row',
    alignSelf: 'center',
    // width: 280,
    // marginLeft: 40,
    // marginRight: 40,
    marginTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10
  },
  flexRow: {
    width: 267,
    marginLeft: 55,
    marginRight: 55,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignContent: 'center',
    paddingLeft: 0,
    paddingRight: 0,
    marginBottom: 5
  },
  column: {
    flexDirection: 'column',
    alignSelf: 'center',
  },
  title: {
    position: 'absolute',
    top: 35,
    // height: 30
  },
  titleText: {
    fontFamily: 'Lato-Bold',
    fontSize: 22,
    textAlign: 'center',
    // height: 25,
    // marginBottom: 25,
    fontWeight: 'bold',
    color: '#000000'
  },
  subtitleText: {
    fontFamily: 'Lato-Bold',
    fontSize: 20,
    marginTop: 10,
    textAlign:'center',
    alignSelf:'center',
    fontWeight: 'bold',
    color: '#6532ad'
  },
  buttonContainer: {
    alignSelf: 'center',
    marginTop: 30,
  },
  buttonText: {
    fontFamily: 'Lato-Bold',
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold'
  },
  iconLabelText: {
    fontFamily: 'Lato-Regular',
    fontSize: 12,
    color: '#0057F0',
  },
  regularText: {
    fontFamily: 'Lato-Regular',
    fontSize: 16,
    color: '#000000',
  },
  boldText: {
    fontFamily: 'Lato-Bold',
    fontSize: 18,
    color: '#000000',
  },
  centerText: {
    textAlign: 'center',
  },
  leftText: {
    textAlign: 'left',
    alignSelf: 'stretch'
  },
  rightText: {
    textAlign: 'right',
    alignSelf: 'stretch'
  },
  right: {
    justifyContent: 'flex-end',
    alignSelf: 'stretch'
  },
  column: {
    flex: 1
  },
  textInput: {
    height: 40,
    width: Dimensions.get("window").width * 0.8,
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
    marginTop: 8
  },
  textInputContainer: {
    width: Dimensions.get("window").width - 20,
    alignItems: 'center',
    margin: 10,
  },
  button: {
    position: 'absolute',
    bottom: 20
  }
})
