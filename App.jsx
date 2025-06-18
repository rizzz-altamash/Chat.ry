// // ===== App.js =====
// import React from 'react';
// import {NavigationContainer} from '@react-navigation/native';
// import {StatusBar} from 'react-native';
// import AppNavigator from './src/navigation/AppNavigator';

// const App = () => {
//   return (
//     <>
//       <StatusBar barStyle="light-content" backgroundColor="#4A00E0" />
//       <NavigationContainer>
//         <AppNavigator />
//       </NavigationContainer>
//     </>
//   );
// };

// export default App;






// App.js
import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from './src/navigation/AppNavigator';
import websocket from './src/services/websocket';

const App = () => {
  useEffect(() => {
    // Check and connect WebSocket if authenticated
    checkAndConnectWebSocket();
    
    return () => {
      // Cleanup on app unmount
      websocket.disconnect();
    };
  }, []);

  const checkAndConnectWebSocket = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        // User is authenticated, connect WebSocket
        await websocket.connect();
      }
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  };

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
};

export default App;