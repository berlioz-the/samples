exports.handler = function(event, context, callback) {
    console.log('PRE TOKEN!!!') 
    var res = {
        headers: {
        },
        statusCode: 200
    }
    res.body = JSON.stringify({message: "PRE TOKEN!!!!!!!"});
    callback(null, res);
}