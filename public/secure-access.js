
var host = window.location.hostname;
console.log("Current host: ", host);

window.onload = function() {
    if (host == "localhost") {
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
    
    // Decrypt access key
    var decrypted = CryptoJS.AES.decrypt("U2FsdGVkX1+7TXVwoaHMeRNPnuISDmJLc0HS2Qk0dyi8WHFbOP4yl2CX2+xsFXU6PxQsXaYEZjE8F234EdunyQ==", key);

    var awsKey = decrypted.toString(CryptoJS.enc.Utf8);
    //console.log("AWS KEY", awsKey);

    AWS.config.credentials = new AWS.Credentials('AKIAIFQRBJI52GUSXZQA', awsKey)
    var s3 = new AWS.S3();
    var params = {Bucket: 'tzina-bundle', Key: 'bundle.js'};
    $(document).ajaxError(function(e, xhr, settings, exception) {
            console.log(e,exception);
            alert("Invalid credentials");
    });
    s3.getSignedUrl('getObject', params, function (err, url) {
        if (err) {
        } else {
            $("#loading-container").show().css("display","flex");
            $.getScript(url);
        }
    });
}
