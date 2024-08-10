const axios = require('axios');

// Define your Sentinel Hub instance ID and API key
const INSTANCE_ID = '76842290-5a14-430f-bbdf-ac8f2df0c171';
const API_KEY = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ3dE9hV1o2aFJJeUowbGlsYXctcWd4NzlUdm1hX3ZKZlNuMW1WNm5HX0tVIn0.eyJleHAiOjE3MjIzNDc0OTksImlhdCI6MTcyMjM0Mzg5OSwianRpIjoiMzAwNzUzMDktNmNjNS00MjNjLWIzNmEtMTk2MmE0ZjViM2ZiIiwiaXNzIjoiaHR0cHM6Ly9zZXJ2aWNlcy5zZW50aW5lbC1odWIuY29tL2F1dGgvcmVhbG1zL21haW4iLCJzdWIiOiI0NTI3MjlkOC0wMGQ3LTQ5ODAtYWNlYi01MGU2YjcyODAxYmUiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiI2MDA1Zjg3OS0xMTYwLTQxZGMtYmNkNy1lYWRhNjZmOTMwOWEiLCJzY29wZSI6ImVtYWlsIHByb2ZpbGUiLCJjbGllbnRJZCI6IjYwMDVmODc5LTExNjAtNDFkYy1iY2Q3LWVhZGE2NmY5MzA5YSIsImNsaWVudEhvc3QiOiI0OS4zNi4yMDEuMTU0IiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJzZXJ2aWNlLWFjY291bnQtNjAwNWY4NzktMTE2MC00MWRjLWJjZDctZWFkYTY2ZjkzMDlhIiwiY2xpZW50QWRkcmVzcyI6IjQ5LjM2LjIwMS4xNTQiLCJhY2NvdW50IjoiMTJhZDc1MmQtMTQ0YS00Mjk0LWI2OGItMGI1YmZhODA3YmM0In0.cA6rTUex3hnhIdhKj8F5SulPoxfKaeUpBF0EFRK-dvoCNPr4ufoQ2Ch5K4o9hvfqWyYdD7JNssTUe1Dy0nxKpd5yqkaFdEyGYIZT3BXteNP25q-3SuU3uE4gRQrLLZ1kGaeSoGRZxcgDIEm7kADl7wFMdzxXAJglx9hX_cah2CPE1UC-I5OnbvCgIpCkc7BfQbWLOkr36I0yAKVrKw5nets2hvEs44aJJa24ryiIE3DQdfTLOmqbo0N642BnEIPq0vHNVSEsqqp3La_oDk842Drbn7MoxD8N-4gKb45xcIbjeyDpfeHXQyKL7pijzL6W8WzkF6r2PnmPTeLHE3_r-A';




// Define the polygon coordinates (example)
const polygon = {
  type: 'Polygon',
  coordinates: [
    [[74.78413825696023, 34.07967080034932], [74.78692775430602, 34.08055942140041], [74.7873569077467, 34.07807125896285], [74.78476768156446, 34.07701673033125]],
  ],
};

// Convert polygon to a string
const polygonStr = JSON.stringify(polygon);

// Define the Evalscript for NDVI calculation
const evalscript = `
  // Version: 3
  function setup() {
    return {
        input: ["B04", "B08"],
        output: { bands: 1 }
    };
  }

  function evaluatePixel(sample) {
    let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
    return [ndvi];
  }
`;

// Define the URL endpoint for Sentinel Hub Process API
const url = 'https://services.sentinel-hub.com/api/v1/process';

// Define the request body
const requestBody = {
  input: {
    bounds: {
      geometry: polygon
    },
    data: [
      {
        type: "S2L2A",  // Sentinel-2 Level-2A data
        dataFilter: {
          timeRange: {
            from: "2023-01-01T00:00:00Z",
            to: "2023-01-31T23:59:59Z"
          },
          maxCloudCoverage: 20
        }
      }
    ]
  },
  output: {
    width: 512,  // Width of the output image
    height: 512, // Height of the output image
    responses: [
      {
        identifier: "default",
        format: {
          type: "image/png"  // Output format
        }
      }
    ]
  },
  evalscript: evalscript
};

// Make the API call
axios
  .post(url, requestBody, {
    headers: {
      'Authorization':`Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
  })
  .then(response => {
    // Process the NDVI data
    const ndviData = response.data;
    console.log(ndviData);
  })
  .catch(error => {
    console.error('Error:', error.response ? error.response.data : error.message);
  });