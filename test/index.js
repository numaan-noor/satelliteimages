const ee = require('@google/earthengine');
const privateKey = require('./analog-crossing-363916-101e26f61f55.json');

// Authenticate using your service account
const authenticate = () => new Promise((resolve, reject) => {
    console.log('hello here');
  ee.data.authenticateViaPrivateKey(privateKey, () => {
    console.log('hello here');
    ee.initialize(null, null, () => {
        console.log('hello here');
      resolve();
    }, (e) => {
      reject(e);
    });
  });
});

async function runAnalysis() {
  try {
    await authenticate();

    console.log('hello here');
    const image = ee.Image('LANDSAT/LC08/C01/T1_TOA/LC08_044034_20140318');
    const geometry = ee.Geometry.Point([-122.262, 37.8719]);
    console.log(geometry);
    const value = image.sample(geometry, 30).first().get('B4').getInfo();
    console.log('Sampled value:', value);

  } catch (e) {
    console.error('Error:', e);
  }
}

runAnalysis();