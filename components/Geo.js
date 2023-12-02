import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Button, Linking } from 'react-native'; // Add Linking import
import * as Location from 'expo-location';

const requestLocationPermission = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error(error);
    return false;
  }
};


const App = () => {
  const [location, setLocation] = useState(null);

  const getLocation = async () => {
    try {
      const isPermissionGranted = await requestLocationPermission();
      console.log('Permission granted:', isPermissionGranted);

      if (isPermissionGranted) {
        const { coords } = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        console.log('Current position:', coords);
        setLocation(coords);
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  const sendLocation = () => {
    try {
      if (location) {
        const tweet = `latitude is ${location.latitude} and longitude is ${location.longitude}`;
        const url = `https://twitter.com/intent/tweet?text=${tweet}`;
        Linking.openURL(url);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text>React Native Geolocation</Text>
      <View style={{ marginTop: 10, padding: 10, borderRadius: 10, width: '40%' }}>
        <Button title="Get Location" onPress={getLocation} />
      </View>
      <Text>Latitude: {location ? location.latitude : null}</Text>
      <Text>Longitude: {location ? location.longitude : null}</Text>
      <View style={{ marginTop: 10, padding: 10, borderRadius: 10, width: '40%' }}>
        <Button title="Send Location" onPress={sendLocation} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;