let ip2countrify = require( 'ip2countrify' );


exports.getCountryName=function(ip,onReady){
  onReady({country: ""});
  /* THIS SERVICE IS DOWN BECAUSE OF AN EXPIRED CERTIFICATE
  if(!ip) console.error("geolocator needs that you specify an ip on the first parameter");
  ip2countrify.lookup(
    ip,
    function( ip, results, error ) {
      if ( error ) {
        return console.warn( 'An error has occurred: ' + error );
      }
      console.log('ip2countrify locating ' + ip + ":");
      console.log(
        // 'countryCode: ' + results.countryCode,
        // 'countryCode3: ' + results.countryCode3,
        'countryName: ' + results.countryName
        // 'countryEmoji: ' + results.countryEmoji
      );
      if(ip=="::1"||ip=="192.168.0.0"||results.countryName=="") results.countryName="Amsterdam";
      if(onReady) onReady({country:results.countryName});
    }
  ); */
}
