/**
 * OutletController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const Geocoding = require('@mapquest/geocoding');
const client = new Geocoding({
  key: 'KoPQHyBHYRZwhIAT94wCMGAM9oU9X8QX'
});
var classifyPoint = require('robust-point-in-polygon');
var location = require('../../delhiveryArea.json').features; //kml converted to geojson

module.exports = {
  outletByAddress: async function(req, res) {
    try {
      let address = req.query.address;
      let result =  await client.forward(address);
      // console.log(result); // returns a GeoJson point of the first match
      for (let i = 0; i < location.length; i++) {
        if (location[i].geometry.type === 'Polygon') {
          let isOutlet = classifyPoint(
            location[i].geometry.coordinates[0],
            result.geometry.coordinates
          );
          if (isOutlet === -1 || isOutlet === 0) {
            console.log(location[i].properties.Name);
            return res.json({
              status: 200,
              message: 'Outlet found.',
              outlet: location[i].properties.Name
            });
          }
        }
      }
      console.log('not found');
      return res.json({
        status: 200,
        message: 'Service not available',
        outlet: 'not found'
      });
    } catch (err) {
      console.log(err);
      return res.status(403).send({
        message: 'Something Went Wrong, Please try again later',
        error:err.message
      });
    }
  }
};
