exports.handler = function(event, context, callback) {
    console.log('HELLO WORLD!!!') 
    var res = {
        headers: {
        },
        statusCode: 200
    }
    res.body = JSON.stringify({message: "HELLO!!!!!!!"});
    callback(null, res);
}