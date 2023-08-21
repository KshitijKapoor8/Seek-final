import App from "./App";
import { registerRootComponent } from "expo";

// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyDsAADyBqhoxk4q04gOidSbCFK5RIftu4w",
//   authDomain: "seek-830f1.firebaseapp.com",
//   projectId: "seek-830f1",
//   storageBucket: "seek-830f1.appspot.com",
//   messagingSenderId: "606185994984",
//   appId: "1:606185994984:web:c73345639a83c16876e75d",
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
