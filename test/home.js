const axios = require('axios');
const fs = require('fs');

// Your Sentinel Hub credentials
const clientId = '6005f879-1160-41dc-bcd7-eada66f9309a';
const clientSecret = 'QoKILbF9TVtkJOLVSUoMM3Bh3nH66dtn';
//76842290-5a14-430f-bbdf-ac8f2df0c171
// Sentinel Hub endpoint for NDVI
const processApiUrl = 'https://services.sentinel-hub.com/api/v1/process';

const polygonWkt = [74.78413825696023, 34.07967080034932, 74.78692775430602, 34.08055942140041, 74.7873569077467, 34.07807125896285, 74.78476768156446, 34.07701673033125]; // Example WKT format
const timeRange = '2024-01-01T00:00:00Z/2024-01-31T23:59:59Z';

// Request NDVI
const processRequest = {
  input: {
    bounds: {
      bbox: polygonWkt,
      properties: {
        crs: "http://www.opengis.net/def/crs/EPSG/0/4326"
      }
    },
    data: [{
      dataFilter: {
        timeRange: {
          from: "2024-01-01T00:00:00Z",
          to: "2024-01-31T23:59:59Z"
        }
      },
      type: "S2L2A"
    }]
  },
  output: {
    width: 512,
    height: 512,
    responses: [{
      identifier: "default",
      format: {
        type: "application/json"
      }
    }]
  },
  evalscript: `
    //VERSION=3
    function setup() {
      return {
        input: ["B04", "B08"],
        output: { id: "default", bands: 1 }
      };
    }

    function evaluatePixel(sample) {
      let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
      return [ndvi];
    }
  `
};

async function getNDVIData() {
  try {
    const tokenResponse = await axios.post('https://services.sentinel-hub.com/oauth/token', new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret
    }));

    const token = tokenResponse.data.access_token;
    console.log(token)

    const response = await axios.post(processApiUrl, processRequest, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('NDVI data:', response.data);
    
    // Optionally, save the JSON data to a file
    fs.writeFileSync('ndvi_output.json', JSON.stringify(response.data, null, 2));
    console.log('NDVI data saved as ndvi_output.json');
  } catch (error) {
    console.error('Error fetching NDVI data:', error.response ? error.response.data : error.message);
    if (error.response && error.response.data) {
      console.error('Error details:', error.response.data);
    }
  }
}
getNDVIData()