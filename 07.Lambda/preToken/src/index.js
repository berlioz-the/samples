exports.handler = (event, context, callback) => {
    console.log(event);
    
    event.response = {
        claimsOverrideDetails: {
            claimsToAddOrOverride: {
                'AAAA': '11111'
            
            }
        }
    };
    
    // Return result to Amazon Cognito
    context.done(null, event);    
};