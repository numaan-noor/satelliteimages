// const axios = require('axios');


// const clientId = '';
// const clientSecret = '';
// const CLIENT_ID = '6005f879-1160-41dc-bcd7-eada66f9309a';
// const CLIENT_SECRET = 'QoKILbF9TVtkJOLVSUoMM3Bh3nH66dtn';
// const TOKEN_URL = 'https://services.sentinel-hub.com/oauth/token';

// axios
//   .post(TOKEN_URL, new URLSearchParams({
//     'grant_type': 'client_credentials',
//     'client_id': CLIENT_ID,
//     'client_secret': CLIENT_SECRET
//   }), {
//     headers: {
//       'Content-Type': 'application/x-www-form-urlencoded'
//     }
//   })
//   .then(response => {
//     const accessToken = response.data.access_token;
//     console.log('Access Token:', accessToken);

//     // You can now use this access token to make requests to the Sentinel Hub API
//   })
//   .catch(error => {
//     console.error('Error generating access token:', error.response ? error.response.data : error.message);
//   });

const axios = require('axios');

// Replace with your actual access token
const ACCESS_TOKEN = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ3dE9hV1o2aFJJeUowbGlsYXctcWd4NzlUdm1hX3ZKZlNuMW1WNm5HX0tVIn0.eyJleHAiOjE3MjIzNDc0OTksImlhdCI6MTcyMjM0Mzg5OSwianRpIjoiMzAwNzUzMDktNmNjNS00MjNjLWIzNmEtMTk2MmE0ZjViM2ZiIiwiaXNzIjoiaHR0cHM6Ly9zZXJ2aWNlcy5zZW50aW5lbC1odWIuY29tL2F1dGgvcmVhbG1zL21haW4iLCJzdWIiOiI0NTI3MjlkOC0wMGQ3LTQ5ODAtYWNlYi01MGU2YjcyODAxYmUiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiI2MDA1Zjg3OS0xMTYwLTQxZGMtYmNkNy1lYWRhNjZmOTMwOWEiLCJzY29wZSI6ImVtYWlsIHByb2ZpbGUiLCJjbGllbnRJZCI6IjYwMDVmODc5LTExNjAtNDFkYy1iY2Q3LWVhZGE2NmY5MzA5YSIsImNsaWVudEhvc3QiOiI0OS4zNi4yMDEuMTU0IiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJzZXJ2aWNlLWFjY291bnQtNjAwNWY4NzktMTE2MC00MWRjLWJjZDctZWFkYTY2ZjkzMDlhIiwiY2xpZW50QWRkcmVzcyI6IjQ5LjM2LjIwMS4xNTQiLCJhY2NvdW50IjoiMTJhZDc1MmQtMTQ0YS00Mjk0LWI2OGItMGI1YmZhODA3YmM0In0.cA6rTUex3hnhIdhKj8F5SulPoxfKaeUpBF0EFRK-dvoCNPr4ufoQ2Ch5K4o9hvfqWyYdD7JNssTUe1Dy0nxKpd5yqkaFdEyGYIZT3BXteNP25q-3SuU3uE4gRQrLLZ1kGaeSoGRZxcgDIEm7kADl7wFMdzxXAJglx9hX_cah2CPE1UC-I5OnbvCgIpCkc7BfQbWLOkr36I0yAKVrKw5nets2hvEs44aJJa24ryiIE3DQdfTLOmqbo0N642BnEIPq0vHNVSEsqqp3La_oDk842Drbn7MoxD8N-4gKb45xcIbjeyDpfeHXQyKL7pijzL6W8WzkF6r2PnmPTeLHE3_r-A';

// Define the URL for a simple request (e.g., WMS GetCapabilities)
const url = 'https://services.sentinel-hub.com/ogc/wms/76842290-5a14-430f-bbdf-ac8f2df0c171?request=GetCapabilities';

// Make the API call
axios
  .get(url, {
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`
    }
  })
  .then(response => {
    console.log('Connected successfully');
    console.log(response.data);  // Print response to verify connection
  })
  .catch(error => {
    console.error('Error:', error.response ? error.response.data : error.message);
  });