function submitForm(){
    var formData = {
        name: $("#name").val(),
        phone: $("#phone").val()
    };

    $.ajax({
        type: "POST",
        url: "/new-contact",
        data: formData,
        success : function(result) {
            restoreButton();
            if (result.error) {
                formError(JSON.stringify(result.error));
            } else {
                window.location.reload();
            }
        },
        error: function() {
            restoreButton();
            formError('Request failed');
        }
    });
}

$(document).ready(function() {
    $("#newContactForm").submit(function(event){
        event.preventDefault();
        clearError();
        animateButton();
        submitForm();
    });
});

function animateButton()
{
    var btn = $("#btnSubmit");
    if (!btn.data('origContents')) {
        btn.data('origContents', btn.html())
    }
    btn.html("<i class='fa fa-circle-notch fa-spin'></i> Working...");
}

function restoreButton()
{
    var btn = $("#btnSubmit");
    btn.html(btn.data('origContents'));
    btn.data('origContents', null);
}

function clearError()
{
    $("#msgSubmit").removeClass("alert");
    $("#msgSubmit").removeClass("alert-danger");
    $("#msgSubmit").empty();
}

function formError(message){
    $("#msgSubmit").addClass("alert");
    $("#msgSubmit").addClass("alert-danger");
    $("#msgSubmit").empty();
    $("#msgSubmit").append("<strong>Error:</strong> " + message );
}
