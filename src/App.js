import React, { Component } from 'react';
import './App.css';
import Navigation from "./components/Navigation.js";
import Logo from "./components/Logo.js";
import ImageLinkForm from "./components/ImageLinkForm.js";
import FaceRecognition from "./components/FaceRecognition.js";
import Rank from "./components/Rank.js"
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import Signin from "./components/Signin.js";
import Register from "./components/Register.js";

/*
https://samples.clarifai.com/metro-north.jpg
https://samples.clarifai.com/face-det.jpg

*/

const app = new Clarifai.App({
     apiKey: 'f30b5096c4f44101bef605bbbd8a021a'
    });

const particlesOptions = {
  particles: {
    number: {
      value: 150,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}


class App extends Component {
  constructor() {
    super();
    this.state = {
      input: "",
      imageUrl: "",
      box: {},
      route: "sign-in",
      isSignedIn: false,
    }
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById("inputImage");
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row*height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({box: box})
    console.log(box);
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value})
  }

  onSubmit = (event) => {
    this.setState( {imageUrl: this.state.input})
    app.models.predict(Clarifai.FACE_DETECT_MODEL, 
      this.state.input)
    .then(response => this.displayFaceBox(this.calculateFaceLocation(response)))
    .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if (route === "sign-out") {
      this.setState({ isSignedIn: false })
    } else if (route === "home") {
      this.setState({ isSignedIn: true })
    } 
    this.setState({ route: route });
  }

  render() {
    const { isSignedIn, route, box, imageUrl } = this.state;
    return (
      <div className="App">
        <Particles className="particles" params={particlesOptions}/>
        <Navigation isSignedIn = {isSignedIn} onRouteChange={this.onRouteChange}/>
        {route === "home" 
        ? <div>
            <Logo />
            <Rank />
            <ImageLinkForm 
              onSubmit={this.onSubmit} 
              onInputChange={this.onInputChange} />
            <FaceRecognition box={box} imageUrl = {imageUrl}/>
          </div> 
          : (route === "sign-in" || route === "sign-out"
          ? <Signin onRouteChange={this.onRouteChange} />
          : <Register onRouteChange={this.onRouteChange} />)
        }
      </div>
    );
  }
}

export default App;
