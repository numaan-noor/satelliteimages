

// Replace with your actual access token
const ACCESS_TOKEN = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ3dE9hV1o2aFJJeUowbGlsYXctcWd4NzlUdm1hX3ZKZlNuMW1WNm5HX0tVIn0.eyJleHAiOjE3MjMyODM4OTIsImlhdCI6MTcyMzI4MDI5MiwianRpIjoiMmJjOGJkMzktNDY1Yi00YzQ0LWExZmQtODhlMjRiODU5YzA4IiwiaXNzIjoiaHR0cHM6Ly9zZXJ2aWNlcy5zZW50aW5lbC1odWIuY29tL2F1dGgvcmVhbG1zL21haW4iLCJzdWIiOiI0NTI3MjlkOC0wMGQ3LTQ5ODAtYWNlYi01MGU2YjcyODAxYmUiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiI2MDA1Zjg3OS0xMTYwLTQxZGMtYmNkNy1lYWRhNjZmOTMwOWEiLCJzY29wZSI6ImVtYWlsIHByb2ZpbGUiLCJjbGllbnRJZCI6IjYwMDVmODc5LTExNjAtNDFkYy1iY2Q3LWVhZGE2NmY5MzA5YSIsImNsaWVudEhvc3QiOiI0OS4zNi4yMDEuMjMzIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJzZXJ2aWNlLWFjY291bnQtNjAwNWY4NzktMTE2MC00MWRjLWJjZDctZWFkYTY2ZjkzMDlhIiwiY2xpZW50QWRkcmVzcyI6IjQ5LjM2LjIwMS4yMzMiLCJhY2NvdW50IjoiMTJhZDc1MmQtMTQ0YS00Mjk0LWI2OGItMGI1YmZhODA3YmM0In0.EhJM7e9r4LTWffDQX70RXdD2er-Aw2Uu2fMZuzEmJ4kWpQzKUhp0qL--sQG7yGu-ac0_Rqfbr_k3bBzfnFMrTm49Ky0j8xAEf_ooULKPUQb5GlIaUDmRrwUSvJuqOdQ6L8owUHt1M5RX_nOlHxl-Z47My57cI9PzoKq0Ra-J3IGx0gnh8q5VESweZyJjDW3di5SxDkUAyLx19_O070QhzyCSHDh5EDWQQuh8o4TM48Eeid4qRfOJ7nMBPHXdrjyEOQSdAnXKh43PRC3-Lbc2u529_O4RMnUT8faofbvHaKTid63qY0ILSDByyePobrg7INXHOMIXtJIsot-qWf8iyw'
const fs = require('fs');
const axios = require('axios');

const lng1 = 73.726632, lat1 = 26.887049;
const lng2 = 73.743594, lat2 = 26.886883;
const lng3 = 73.733735, lat3 = 26.872670;

const polygon = {
  type: 'Polygon',
  coordinates: [
    [
      [lng1, lat1],
      [lng2, lat2],
      [lng3, lat3],
      [lng1, lat1],
    ],
  ],
};

// Define the Evalscript for NDMI calculation with color blending
const evalscript = `
//VERSION=3

function setup() {
  return {
    input: ["B8A", "B11"],
    output: { bands: 3 }
  };
}

function evaluatePixel(sample) {
  let index = (sample.B8A - sample.B11)/(sample.B8A + sample.B11);
  let val = colorBlend(index, 
                       [-1, -0.5, -0.2, 0, 0.2, 0.5, 1], 
                       [[1,0,0], [1,0.5,0], [1,1,0], [0,1,0], [0,1,1], [0,0.5,1], [0,0,1]]);
  return val;
}
`;

// Define the URL endpoint for Sentinel Hub Process API
const url = `https://services.sentinel-hub.com/api/v1/process`;

// Define the request body
const requestBody = {
  input: {
    bounds: {
      geometry: polygon
    },
    data: [
      {
        type: "S2L1C",  // Sentinel-2 Level-1C data
        dataFilter: {
          timeRange: {
            from: "2024-07-10T00:00:00Z",
            to: "2024-08-10T23:59:59Z"
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
          type: "image/png"  // Request PNG format for image output
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
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'image/png'  // Request PNG format
    },
    responseType: 'arraybuffer'  // Handle response as binary data
  })
  .then(response => {
    const imageBuffer = Buffer.from(response.data, 'binary');
    fs.writeFileSync('ndmi_image_detailed.png', imageBuffer);
    console.log('Detailed NDMI image saved as ndmi_image_detailed.png');
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
