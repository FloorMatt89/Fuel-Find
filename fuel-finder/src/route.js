function initMap() {
    if (isGoogleMapsApiLoaded()) {
        // Load epoly.js after the Google Maps API has finished loading
        loadScript("epoly.js", function() {
            console.log("epoly.js has been loaded");
            // Call calculateRoute here to ensure it runs after epoly.js is loaded
            var map = new google.maps.Map(document.getElementById('map'), {
                zoom: 7,
                center: {lat: 40.7128, lng: -74.0060} // Example coordinates
            });
        
            var directionsService = new google.maps.DirectionsService();
            var directionsRenderer = new google.maps.DirectionsRenderer();
            directionsRenderer.setMap(map);
        
            calculateRoute(directionsService, directionsRenderer, 'Orlando, FL', 'San Francisco, CA', 160934.4 , 482803.2, true);
        });
    } else {
        setTimeout(initMap, 100); // Retry after 100 milliseconds
    }
}

function loadScript(url, callback){
    var script = document.createElement("script");
    script.type = "text/javascript";

    if (script.readyState){ 
        script.onreadystatechange = function(){
            if (script.readyState == "loaded" ||
                    script.readyState == "complete"){
                script.onreadystatechange = null;
                callback();
            }
        };
    } else {  //Others
        script.onload = function(){
            callback();
        };
    }

    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
}


function calculateRoute(directionsService, directionsRenderer, originPoint, destinationPoint, currRange, maxRange, firstPass) {
    var origin = originPoint;
    var destination = destinationPoint;
    calculateSegment(directionsService, directionsRenderer, origin, destination, [], origin, currRange, maxRange, firstPass);
}

function calculateSegment(directionsService, directionsRenderer, start, end, waypoints, initialStart, currRange, maxRange, firstPass) {
    directionsService.route({
        origin: start,
        destination: end,
        travelMode: 'DRIVING'
    }, function(response, status) {
        if (status === 'OK') {
            var path = response.routes[0].overview_path;
            var polyline = new google.maps.Polyline({ path: path });
            var point;
            if (firstPass) {
                point = polyline.GetPointAtDistance(currRange);
            } else {
                point = polyline.GetPointAtDistance(maxRange);
            }

            if (point) {
                waypoints.push({
                    location: point,
                    stopover: true
                });
                // Recursively calculate the next segment
                calculateSegment(directionsService, directionsRenderer, point, end, waypoints, initialStart, maxRange, maxRange, false);
            } else {
                // No more points at 300 miles, display the final route
                displayRoute(directionsService, directionsRenderer, initialStart, end, waypoints);
            }
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}

function displayRoute(directionsService, directionsRenderer, start, end, waypoints) {
    directionsService.route({
        origin: start,
        destination: end,
        waypoints: waypoints,
        travelMode: 'DRIVING'
    }, function(response, status) {
        if (status === 'OK') {
            directionsRenderer.setDirections(response);
        } else {
            window.alert('Directions request with waypoints failed due to ' + status);
        }
    });
}

function isGoogleMapsApiLoaded() {
    return typeof google !== 'undefined' && typeof google.maps !== 'undefined';
}

