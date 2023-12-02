import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  Image,
  Alert,
  TouchableHighlight,
  BackHandler,
} from "react-native";
import Status from "./components/Status";
import Toolbar from "./components/Toolbar";
import MessageList from "./components/Messagelist";
import {
  createImageMessage,
  createLocationMessage,
  createTextMessage,
} from "./utils/MessageUtils";
import * as Location from 'expo-location';


export default class App extends React.Component {
  state = {
    messages: [
      createImageMessage("https://unsplash.it/300/300"),
      createTextMessage("World"),
      createTextMessage("Hello"),
      createLocationMessage({
        latitude: 37.78825,
        longitude: -122.4324,
      }),
    ],
    fullscreenImageId: null,
    isInputFocused: false,
  };

  dismissFullscreenImage = () => {
    this.setState({ fullscreenImageId: null });
  };

  renderFullscreenImage = () => {
    const { messages, fullscreenImageId } = this.state;
    if (!fullscreenImageId) return null;

    const image = messages.find((message) => message.id === fullscreenImageId);
    if (!image) return null;

    const { uri } = image;
    return (
      <TouchableHighlight
        style={styles.fullscreenOverlay}
        onPress={this.dismissFullscreenImage}
        underlayColor="transparent"
      >
        <Image
          style={styles.fullscreenImage}
          source={{ uri }}
          resizeMode="contain"
        />
      </TouchableHighlight>
    );
  };

  handlePressMessage = ({ id, type }) => {
    switch (type) {
      case "text":
        Alert.alert(
          "Delete message?",
          "Are you sure you want to permanently delete this message?",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => this.handleDeleteMessage(item.id),
            },
          ]
        );
        break;

      case "image":
        this.setState({ fullscreenImageId: id });
        break;

      default:
        break;
    }
  };

  handleDeleteMessage = (id) => {
    this.setState((state) => ({
      messages: state.messages.filter((message) => message.id !== id),
    }));
  };

  handlePressToolbarCamera = () => {
    // ...
  };
  
  handleChangeFocus = (isFocused) => {
    this.setState({ isInputFocused: isFocused });
  };
  handleSubmit = (text) => {
    const { messages } = this.state;
    this.setState({
      messages: [createTextMessage(text), ...messages],
    });
  };

  

  handlePressToolbarLocation = async () => {
    const { messages } = this.state;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      this.setState({
        messages: [
          createLocationMessage({
            latitude,
            longitude,
          }),
          ...messages,
        ],
      });
    } catch (error) {
      console.error(error);
    }
  };
  
  renderToolbar() {
    const { isInputFocused } = this.state;
    return (
      <Toolbar
        isFocused={isInputFocused}
        onSubmit={this.handleSubmit}
        onChangeFocus={this.handleChangeFocus}
        onPressCamera={this.handlePressToolbarCamera}
        onPressLocation={this.handlePressToolbarLocation}
      />
    );
  }

  componentDidMount() {
    this.subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        const { fullscreenImageId } = this.state;
        if (fullscreenImageId) {
          this.dismissFullscreenImage();
          return true;
        }
        return false;
      }
    );
  }

  componentWillUnmount() {
    this.subscription.remove();
  }

  render() {
    return (
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?q=80&w=2127&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        }}
        style={styles.container}
      >
        <View style={styles.innerContainer}>
          <Status />
          {this.renderFullscreenImage()}
          <MessageList
            messages={this.state.messages}
            onPressMessage={this.handlePressMessage}
          />
          {this.renderToolbar()}
        </View>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  content: {
    flex: 1,
    backgroundColor: "white",
  },
  inputMethodEditor: {
    flex: 1,
    backgroundColor: "white",
  },
  toolbar: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.04)",
    backgroundColor: "white",
  },
  fullscreenOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "black",
    zIndex: 1000, // Ensure it covers other components
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenImage: {
    flex: 1,
    resizeMode: "contain",
    width: "100%",
    height: "100%",
  },
});
