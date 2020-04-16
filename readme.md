# Update for OAuth v2.0 Endpoints
--All API calls now hit the v2.0 endpoints.

--Function now returns UserData and Token object with UserId, DisplayName, Token, RefreshToken, and Expires_In properties.

--IMPORTANT: In order for UserId and DisplayName to be populated, scope must include 'user.read', or another scope that includes user   data. Similarly, RefreshToken will only be populated with a 'offline_access' scope included.

# azure-ad-graph-expo
#### by pinecat

### About
This is a simple JavaScript library designed to be used with [Expo](https://expo.io).  This utilizes Expo's AuthSession to authenticate via Microsoft Azure AD.  It follows Microsoft's Azure authentication flow to first login the user, then acquire a token, and then use that token to query the Microsoft Graph API /me endpoint to get user data.

### Example Code
```javascript
import React from 'react';
import { StyleSheet, View, Text, Button } from 'react-native'
import { AuthSession } from 'expo';
import { openAuthSession } from 'azure-ad-graph-expo';
import { AsyncStorage } from 'react-native';

export default class App extends React.Component {
  state = {
    result: null,
  };

  render() {
    return (
      <View style={styles.container}>
        <Button title="Login" onPress={loginAsync()} />
        {this.state.result ? (
          <Text>{JSON.stringify(this.state.result)}</Text>
        ) : <Text>Nothing to see here.</Text>}
      </View>
    );
  }

const loginAsync = async () => {
    return async dispatch => {

      let response;

      try
      {
        response = await openAuthSession(azureAdAppProps);
      }
      catch(err)
      {
        let message;
        if(err.error)
        {
          message = err.error.message;
        }
        else
        {
          message = 'An unkown error occured.'
        }

        throw new Error(message);
      }
  
      try
      {
        const resData =  response;
        dispatch(
          authenticate(
            resData.userId,
            resData.displayName,
            resData.token,
            resData.refreshToken,
            parseInt(resData.expiresIn) * 1000
          )
        );
        const expirationDate = new Date(
          new Date().getTime() + parseInt(resData.expiresIn) * 1000
        );
        saveDataToStorage(resData.userId, resData.displayName, resData.token,
          resData.refreshToken, expirationDate);
        }
      catch(err)
      {
        let message;
        if(err.error)
        {
          message = err.error.message;
        }
        else
        {
          message = 'An unkown error occured.'
        }

        throw new Error(message);
      }
      
    };
  };


  _handlePressAsync = async () => {
    let result = await loginAsync();
    this.setState({ result });
  }
}


  const saveDataToStorage = (userId, displayName, token, refreshToken, expirationDate) => {
    AsyncStorage.setItem(
      'userData',
      JSON.stringify({
        userId: userId,
        displayName : displayName,
        token: token,
        refreshToken: refreshToken,
        expiryDate: expirationDate.toISOString()
      })
    );
  };


const azureAdAppProps = {
  clientId: 'client_id',
  tenantId: 'tenant_id',
  scope: 'user.read',
  redirectUrl: AuthSession.getRedirectUrl(),
  clientSecret: 'client_secret',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```
