$(document).ready(function() {
    $("#newContactForm").submit(function(event){
        event.preventDefault();
        submitForm();
    });
});

function submitForm(){
    var formData = {
        name: $("#name").val(),
        phone: $("#phone").val()
    };

    $.ajax({
        type: "POST",
        url: "/new-contact",
        data: formData,
        success : function(result){
            if (result.error) {
                formError(result.error);
            } else {
                window.location.reload();
            }
        },
        error: function() {
            formError('Request failed');
        }
    });
}

function formError(message){
    $("#msgSubmit").addClass("alert");
    $("#msgSubmit").addClass("alert-danger");
    $("#msgSubmit").empty();
    $("#msgSubmit").append("<strong>Error:</strong> " + message );
}
