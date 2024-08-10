const ACCESS_TOKEN = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ3dE9hV1o2aFJJeUowbGlsYXctcWd4NzlUdm1hX3ZKZlNuMW1WNm5HX0tVIn0.eyJleHAiOjE3MjMyOTg1NzYsImlhdCI6MTcyMzI5NDk3NiwianRpIjoiYTJkZmViZDktYjkyMC00M2ZhLWI4ZDMtYTc4OTEwNGY5MTA4IiwiaXNzIjoiaHR0cHM6Ly9zZXJ2aWNlcy5zZW50aW5lbC1odWIuY29tL2F1dGgvcmVhbG1zL21haW4iLCJzdWIiOiI0NTI3MjlkOC0wMGQ3LTQ5ODAtYWNlYi01MGU2YjcyODAxYmUiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiI2MDA1Zjg3OS0xMTYwLTQxZGMtYmNkNy1lYWRhNjZmOTMwOWEiLCJzY29wZSI6ImVtYWlsIHByb2ZpbGUiLCJjbGllbnRJZCI6IjYwMDVmODc5LTExNjAtNDFkYy1iY2Q3LWVhZGE2NmY5MzA5YSIsImNsaWVudEhvc3QiOiI0OS4zNi4yMDEuMjMzIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJzZXJ2aWNlLWFjY291bnQtNjAwNWY4NzktMTE2MC00MWRjLWJjZDctZWFkYTY2ZjkzMDlhIiwiY2xpZW50QWRkcmVzcyI6IjQ5LjM2LjIwMS4yMzMiLCJhY2NvdW50IjoiMTJhZDc1MmQtMTQ0YS00Mjk0LWI2OGItMGI1YmZhODA3YmM0In0.X4A3CBWV8C6cAl9H0A1XkZIzjAfypeNroedz_SIMc6gZ6YJfyjBizOSCm--TwQYg9B7aXUG4XHlPisXm6sF-7aBNJtlc-vNi3ku_MoDHq_BImrZHDP3cW0E3moN7voNkFW1LU-pFUwf7einoYkpVVCd5SqOFd8tsjX7uRd5zl4xQkeN_TzgUhZ-WTZWrB9kNG6DkZMF6oJ0YPVcY1WY63d5oefewJ-ZCvf6-gn5pbA-AMZIEEPA2nbDq1cz1QQ7pbJCh7sNmyvzcHkx5CRulUM0XQ0oNuHN9Z-hMghOoChL2BaoRTrvYrr3fbf1amKJYC87b46Iqsicq-_hWJe3YlQ'; // Make sure to replace this with your actual access token
const fs = require('fs');
const axios = require('axios');

// Define your geographical polygon coordinates
const polygon = {
  type: 'Polygon',
  coordinates: [
    [
      [77.745356, 34.865844],
      [77.768630, 34.868575],
      [77.764419, 34.852465],
      [77.745356, 34.865844], // Closing the polygon by repeating the first point
    ],
  ],
};

// Define the Evalscript without console.log
const evalscript = `
//VERSION=3

const blue_red = [
  [223, 0x003d99],
  [253, 0x2e82ff],  
  [263, 0x80b3ff],
  [272, 0xe0edff],
  [273, 0xffffff],
  [274, 0xfefce7],
  [283, 0xFDE191],
  [293, 0xf69855],
  [303, 0xec6927],
  [323, 0xaa2d1d],
  [363, 0x650401],
  [373, 0x3d0200],
];

const minTemp = -20; // Minimum temperature in Celsius
const maxTemp = 50;  // Maximum temperature in Celsius

function mapToTemperature(value, minValue, maxValue, minTemp, maxTemp) {
  return minTemp + ((value - minValue) / (maxValue - minValue)) * (maxTemp - minTemp);
}

const minDataValue = 223;
const maxDataValue = 373;

const viz = new ColorRampVisualizer(blue_red);

function evaluatePixel(samples) {
  let val = samples.F2;
  // Convert data value to temperature
  let tempC = mapToTemperature(val, minDataValue, maxDataValue, minTemp, maxTemp);
  // Process color mapping
  val = viz.process(tempC);
  val.push(samples.dataMask);
  return val;
}

function setup() {
  return {
    input: [{
      bands: [
        "F2",
        "dataMask"
      ]
    }],
    output: {
      bands: 4
    }
  }
}
`;

// Define the Sentinel Hub process API URL
const url = `https://creodias.sentinel-hub.com/api/v1/process`;

const requestBody = {
  input: {
    bounds: {
      geometry: polygon
    },
    data: [
      {
        type: "S3SLSTR",
        dataFilter: {
          timeRange: {
            from: "2023-07-10T00:00:00Z",
            to: "2023-08-10T23:59:59Z"
          },
          maxCloudCoverage: 20
        }
      }
    ]
  },
  output: {
    width: 512,
    height: 512,
    responses: [
      {
        identifier: "default",
        format: {
          type: "image/png"
        }
      }
    ]
  },
  evalscript: evalscript
};

// Send the request to Sentinel Hub
axios
  .post(url, requestBody, {
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'image/png'
    },
    responseType: 'arraybuffer'
  })
  .then(response => {
    console.log(response)
    const imageBuffer = Buffer.from(response.data, 'binary');
    fs.writeFileSync('visualized_image.png', imageBuffer);
    console.log('Visualized image saved as visualized_image.png');
    // Optionally log raw image data or processed results
    // console.log('Raw image data:', response.data);
  })
  .catch(error => {
    if (error.response) {
      const errorData = Buffer.from(error.response.data, 'binary').toString('utf8');
      try {
        const parsedError = JSON.parse(errorData);
        console.error('API Error:', JSON.stringify(parsedError, null, 2));
      } catch (parseError) {
        console.error('Error parsing response:', errorData);
      }
    } else {
      console.error('Error:', error.message);
    }
  });
