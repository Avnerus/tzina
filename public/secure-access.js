var host = window.location.hostname;
console.log("Current host: ", host);

window.onload = function() {
    if (0 && host == "localhost") {
        $("#loading-container").show();
        $.getScript( "bundle.js");
    } else {
        $("#secure-access-container").css("display", "flex");
        $("#secure-form").submit(function(event) {
            $("#secure-access-container").hide();
            secureLogin(event.target["password"].value);
            event.preventDefault();
        })
    }
}

function secureLogin(key) {
    AWS.config.credentials = new AWS.Credentials('AKIAJESWQKXYB6SESMAQ', key)
    var s3 = new AWS.S3();
    var params = {Bucket: 'tzina-secure', Key: 'bundle.js'};
    $(document).ajaxError(function(e, xhr, settings, exception) {
            alert("Invalid credentials");
    });
    s3.getSignedUrl('getObject', params, function (err, url) {
        if (err) {
            console.log("ERROR ", err);
        } else {
            $("#loading-container").show();
            $.getScript(url);
        }
    });
}
