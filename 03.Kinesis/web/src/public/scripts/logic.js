$(document).ready(function() {
    $("#newJobForm").submit(function(event){
        event.preventDefault();
        submitForm();
    });
});

function submitForm(){
    var formData = {
        name: $("#name").val()
    };

    $.ajax({
        type: "POST",
        url: "/new-job",
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
