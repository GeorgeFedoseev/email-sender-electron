var https = require("https")

module.exports =  { 

    timeout: function (ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    get_body: function(url){
    	return new Promise((resolve, reject) => {

			https.get(url, function(res) {
	          console.log("Got response: " + res.statusCode);
	          var body = '';
	          res.on('data', function (chunk) {
	            console.log("chunk: "+chunk)
	            body += chunk;
	          });
	          res.on('end', function () {            
	            resolve(body);	            
	          });

	        }).on('error', function(e) {
	          console.log("Got error: " + e.message);
	          throw e
	        });
    	});
    },

    get_json: async function(url){
    	
    	var body = await this.get_body(url);

    	return JSON.parse(body);
    }
}