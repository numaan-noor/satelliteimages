const ACCESS_TOKEN = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ3dE9hV1o2aFJJeUowbGlsYXctcWd4NzlUdm1hX3ZKZlNuMW1WNm5HX0tVIn0.eyJleHAiOjE3MjMyOTE3NjEsImlhdCI6MTcyMzI4ODE2MSwianRpIjoiZWUwMTdlYTItNTZlZi00ZTUyLTg0MzEtYzkyYzdlMTYxNWFjIiwiaXNzIjoiaHR0cHM6Ly9zZXJ2aWNlcy5zZW50aW5lbC1odWIuY29tL2F1dGgvcmVhbG1zL21haW4iLCJzdWIiOiI0NTI3MjlkOC0wMGQ3LTQ5ODAtYWNlYi01MGU2YjcyODAxYmUiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiI2MDA1Zjg3OS0xMTYwLTQxZGMtYmNkNy1lYWRhNjZmOTMwOWEiLCJzY29wZSI6ImVtYWlsIHByb2ZpbGUiLCJjbGllbnRJZCI6IjYwMDVmODc5LTExNjAtNDFkYy1iY2Q3LWVhZGE2NmY5MzA5YSIsImNsaWVudEhvc3QiOiI0OS4zNi4yMDEuMjMzIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJzZXJ2aWNlLWFjY291bnQtNjAwNWY4NzktMTE2MC00MWRjLWJjZDctZWFkYTY2ZjkzMDlhIiwiY2xpZW50QWRkcmVzcyI6IjQ5LjM2LjIwMS4yMzMiLCJhY2NvdW50IjoiMTJhZDc1MmQtMTQ0YS00Mjk0LWI2OGItMGI1YmZhODA3YmM0In0.mVHjSwrKOWx6Bao9mBd21e_KfbEFNHdtsgVFKW78SUhqvr0-xub0GGZR5VpV6ywG36IM4qdboTjoU1YTSO4h1usWIfhMKSHFArsj2MCvDDnMgQbJj-xCAqn6SpNGEPS_C-7-UF8il3LVFgaSKpYIyZO-FTtb9dZkBMrKEnkg6HXh1ZY6fFOGcHQV64Cw3Kek-8t_XysI94UC9R-Rc21qyy3BwJGPy50eI-JUr1RrRPGuXpuqaQS1fToQeWh4HqiEf8I5X1XTumpNJx1IVVc_wm3nOq8IUJo5-_olBtwiaeLcRJvtngUNw0z7jfMrSapA15oo9M4YQPXRXkoXojk_2w'
const fs = require('fs');
const axios = require('axios');

// Define your geographical polygon coordinates
const polygon = {
  type: 'Polygon',
  coordinates: [
    [
      [74.768204, 34.072192],
      [74.767622, 34.072340],
      [74.767603, 34.071997],
      [74.767922, 34.071813],
      [74.768204, 34.072192],  // Closing the polygon by repeating the first point
    ],
  ],
};

const evalscript = `
//VERSION=3

function setup() {
  return {
    input: ["B04", "B08"],
    output: { bands: 4 }  // Change to 4 bands to include alpha channel
  };
}

function evaluatePixel(sample) {
  let index = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
  let val = colorBlend(index,
                       [-1, 0, 0.2, 0.4, 0.6, 0.8, 1],
                       [[1,0,1,1], [1,0.5,0,1], [1,1,0,1], [0.5,1,0.5,1], [0,1,0,1], [0,0.5,1,1], [0,0,1,1]]);
  
  // Add transparency for areas outside the valid index range
  if (index < -1 || index > 1 || isNaN(index)) {
    return [0, 0, 0, 0];  // Fully transparent
  }
  
  return val;
}
`;

const url = `https://services.sentinel-hub.com/api/v1/process`;

const requestBody = {
  input: {
    bounds: {
      geometry: polygon
    },
    data: [
      {
        type: "S2L1C",
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
    const imageBuffer = Buffer.from(response.data, 'binary');
    fs.writeFileSync('chlorophyll_index_image.png', imageBuffer);
    console.log('Chlorophyll Index image saved as chlorophyll_index_image.png');
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
