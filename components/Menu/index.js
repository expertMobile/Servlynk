import React from 'react';
import PropTypes from 'prop-types';
import {
  Dimensions,
  StyleSheet,
  ScrollView,
  View,
  Image,
  Text
} from 'react-native';
import appStyles from '@/AppStyles'

const window = Dimensions.get('window');

export default function Menu({ onItemSelected }) {
  return (
    <ScrollView scrollsToTop={false} style={styles.menu}>
      <Text onPress={() => onItemSelected('Services')} style={[appStyles.regularText, styles.item]}>
        Services
      </Text>
      <Text onPress={() => onItemSelected('Profile')} style={[appStyles.regularText, styles.item]}>
        Profile
      </Text>
      <Text onPress={() => onItemSelected('Buying')} style={[appStyles.regularText, styles.item]}>
        Buying
      </Text>
      <Text onPress={() => onItemSelected('Selling')} style={[appStyles.regularText, styles.item]}>
        Selling
      </Text>
      <Text onPress={() => onItemSelected('Logout')} style={[appStyles.regularText, styles.item]}>
        Logout
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  menu: {
    flex: 1,
    width: window.width,
    height: window.height,
    // backgroundColor: 'gray',
    padding: 20,
    marginTop: 40
  },
  name: {
    position: 'absolute',
    left: 70,
    top: 20,
  },
  item: {
    fontSize: 20,
    fontWeight: '300',
    paddingTop: 5,
    padding: 10
  },
});

Menu.propTypes = {
  onItemSelected: PropTypes.func.isRequired,
};
