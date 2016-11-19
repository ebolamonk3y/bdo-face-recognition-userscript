// ==UserScript==
// @name         BDO-Face-Recognition-Userscript
// @namespace    http://aymenfurter.ch/
// @version      0.1
// @description  Filters out non-asian users on Badoo.com using face detection and face recognition (Face Recognition by betafaceapi.com) (DEMONSTRATION ONLY/POC!)
// @author       U
// @match        https://badoo.com/*
// @grant        none
// ==/UserScript==

var initDone = false;
var jq = document.createElement("script");

jq.src = "https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js";
jq.addEventListener("load", proceed); // pass my hoisted function
document.querySelector("head").appendChild(jq);


function sendURL(cb, imgurl, ele) {
    xhr = new XMLHttpRequest();
    var url = "http://betafaceapi.com/service_json.svc/UploadNewImage_Url";
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json");

    var imgUrlLocal = imgurl;
    var ele_local = ele;
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var json = JSON.parse(xhr.responseText);
            cb(json, imgUrlLocal, ele_local);
        }
    };

    var data = JSON.stringify({
        "api_key": "d45fd466-51e2-4701-8da8-04351c872236",
        "api_secret": "171e8465-f548-401d-b63b-caf0dc28df5f",
        "image_url": imgurl.split("?")[0],
        "original_filename": "String content"
    });
    xhr.send(data);
}


function getRaceForImg(cb, img_uid, imgurl, ele) {
    xhr = new XMLHttpRequest();
    var url = "http://www.betafaceapi.com/service_json.svc/GetImageInfo";
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json");
    var imgLocal = imgurl;
    var cbLocal = cb;
    var img_uidLocal = img_uid;
    var ele_local = ele;
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
			
				var json = JSON.parse(xhr.responseText);
				if (json.string_response == "Request is in the queue") {

					setTimeout(function() {
						getRaceForImg(cbLocal, img_uidLocal, imgLocal, ele_local);
					}, 500);
				}
				var tagsLength = json.faces[0].tags.length;
				for (var i = 0; i < tagsLength; i++) {
					tag = json.faces[0].tags[i];
					if (tag.name == "race" && tag.value == "asian") {
						cb(true, imgLocal, ele_local);
					}
				}
			
        }
    };

    var data = JSON.stringify({
        "api_key": "d45fd466-51e2-4701-8da8-04351c872236",
        "api_secret": "171e8465-f548-401d-b63b-caf0dc28df5f",
        "img_uid": img_uid
    });
    xhr.send(data);

};

function proceed() {
    if (!initDone) {
        initDone = true;
        setTimeout(function() {
            startTheMagic();
        }, 500);
    }
}

function startTheMagic() {
    if (location.href == "https://badoo.com/search") {
        alert("Scan is starting. This will take up to 60 seconds, please wait.");

        var amountOfPages = 10;

        for (var i = 1; i <= amountOfPages; i++) {
            setTimeout(function() {
                loadNextPage();
            }, i * 1000);
        }

        $(".sidebar").hide();
        setTimeout(function() {
            $("#page").hide();
            $(".pagination").hide();
            filterPerson();
        }, amountOfPages * 5000 + 50);
    }
}

function filterPerson() {
	var i=0;
    $(".user-card").each(function() {
		i = i + 1;
		
        jQuery(this).css('opacity', '0');
        var imgurl = $(this).find("img")[0].src;
        var ele = this;

        var cb = function(obj, imgurl, element) {
            var cbRace = function(raceResponse, url, elev) {                
                jQuery(elev).css('opacity', '1');
            };

            setTimeout(function() {
                getRaceForImg(cbRace, obj.img_uid, imgurl, element);
            }, 500);
        };

		setTimeout(function() {
                sendURL(cb, imgurl, ele);
        }, i * 1000);
        

    });
}

function loadNextPage() {
    var cloned = $(".section-content").first().clone();
    cloned.remove(".pagination");
    cloned.appendTo("body");
    $(".pagination").children().last().children().last()[0].click();
}
