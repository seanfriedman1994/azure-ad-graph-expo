// +------------------------------------------------------------------------------------------+
// | ------------------EDITED By SeanFriedman1994 for OAuth v2.0------------------------------|                                                                                      |
// |                                                                                          |
// | AzureADGraph.js                                                                          |
// | ---------------                                                                          |
// | Created by pinecat (https://github.com/pinecat/azure-ad-graph-expo)                      |
// |                                                                                          |
// | JavaScript library designed for use with Expo (https://expo.io).                         |
// | This library follows Microsoft's Azure AD authentication flow using                      |
// | Expo's own AuthSession to return user data from the Microsoft Graph                      |
// | API (/me endpoint).                                                                      |
// | You must register an app in Azure AD before you can authenticate using this method.      |
// | AzureADGraph is NOT a react component.                                                   |
// |                                                                                          |
// | https://docs.microsoft.com/en-us/azure/active-directory/develop/v1-protocols-oauth-code  |
// | https://docs.microsoft.com/en-us/graph/use-the-api                                       |
// |                                                                                          |
// +------------------------------------------------------------------------------------------+

/* imports */
import { AuthSession } from 'expo'; // AuthSession: for opening the authorization URL
import {AsyncStorage} from 'react-native';

/*
  openAuthSession
    opens connection to the azure ad authentication url using Expo's AuthSession
  params:   props - a JSON object of your app properies (i.e. clientId, tenantId, etc)
  returns:  getToken() - calls getToken which calls callMsGraph to return the user data from the Graph API
*/
export async function openAuthSession(props) {

  let authResponse = await AuthSession.startAsync({
    authUrl:
      `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${props.clientId}&response_type=code&redirect_uri=${encodeURIComponent(props.redirectUrl)}&responsemode=query&scope=${props.scope}`, 
    });
  return await getToken(authResponse.params.code, props);
}

/*
  getToken
    sends POST request to MS Azure AD token endpoint to get a token that can be used to
    query the MS Graph API.  also forms the body to be send in the POST request
  params:   code - the code that was recieved when the user logged in via Azure
            props - the Azure AD app properties used to construct the request
  returns:  callMsGraph() - callMsGraph will return the user data from the Graph API
*/
async function getToken(code, props) {
  /* parse/gather correct key values for the POST request to the token endpoint */
  var requestParams = {
    grant_type: 'authorization_code',
    client_id: props.clientId,
    code: code,
    redirect_uri: props.redirectUrl,
    scope: props.scope
  }

  /* loop through object and encode each item as URI component before storing in array */
  /* then join each element on & */
  /* request is x-www-form-urlencoded as per docs: https://docs.microsoft.com/en-us/graph/use-the-api */
  var formBody = [];
  for (var p in requestParams) {
    var encodedKey = encodeURIComponent(p);
    var encodedValue = encodeURIComponent(requestParams[p]);
    formBody.push(encodedKey + '=' + encodedValue);
  } 
  formBody = formBody.join('&');

  /* make a POST request using fetch and the body params we just setup */
  let tokenResponse = null;

  await fetch(`https://login.microsoftonline.com/common/oauth2/v2.0/token`, {
    method: 'POST',
    headers: {
      'Host': 'login.microsoftonline.com',
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    body: formBody
  })
  .then((response) => response.json())
  .then((response) => {
    tokenResponse = response;
  })
  .catch((error) => {
  });

  let accessToken = tokenResponse.access_token;
  let expires_in = tokenResponse.expires_in;
  
  let graphResponse = await callMsGraph(accessToken);

  let userData = {
    userId : graphResponse.userId,
    displayName : graphResponse.displayName,
    token : accessToken,
    expiresIn : expires_in
  }

  return userData;
}

/*
  callMsGraph
    queries the Microsoft Graph API to return user data
  params:   token - the unique token used to query the logged in user in the Graph API
  returns:  graphResponse - a JSON object of the user data
*/
async function callMsGraph(token) {
  /* make a GET request using fetch and querying with the token */
  let graphResponse = null;
  await fetch('https://graph.microsoft.com/v1.0/me', {
    method: 'GET',
    headers: {
      'Host' : 'graph.microsoft.com',
      'Authorization': 'Bearer ' + token,
    }
  })
  .then((response) => response.json())
  .then((response) => {
    graphResponse = response;
  })
  .catch((error) => {
  });

  return graphResponse;
}
