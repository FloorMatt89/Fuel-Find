function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 7,
        center: {lat: 40.7128, lng: -74.0060} // Example coordinates
    });

    var directionsService = new google.maps.DirectionsService();
    var directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    calculateRoute(directionsService, directionsRenderer);
}


function calculateRoute(directionsService, directionsRenderer) {
    var origin = 'Miami, FL';
    var destination = 'Chicago, IL';

    calculateSegment(directionsService, directionsRenderer, origin, destination, []);
}

function calculateSegment(directionsService, directionsRenderer, start, end, waypoints) {
    directionsService.route({
        origin: start,
        destination: end,
        travelMode: 'DRIVING'
    }, function(response, status) {
        if (status === 'OK') {
            var path = response.routes[0].overview_path;
            var point = path.GetPointAtDistance(482803.2); // Get point at 300 miles

            if (point) {
                waypoints.push({
                    location: point,
                    stopover: true
                });
                // Recursively calculate the next segment
                calculateSegment(directionsService, directionsRenderer, point, end, waypoints);
            } else {
                // No more points at 300 miles, display the final route
                displayRoute(directionsService, directionsRenderer, start, end, waypoints);
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
