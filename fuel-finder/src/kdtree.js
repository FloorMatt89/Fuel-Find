/**
 * Project 3
 * Data Structures and Algorithms
 * Matthew Segura, Brian Borrego, Adrian Lehnhaeuser
 *
 * References:
 * Building KD tree: https://github.com/ubilabs/kd-tree-javascript
 * Longitude Latitude Conversions: https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
 */
class Node {
    //construct node class with point (y, x) lat/lon values and right/left child along with depth of point in tree
    constructor(point, depth) {
        this.point = point;
        this.left = null;
        this.right = null;
        this.depth = depth;
    }
}
//built with dimension of 2; K=2
class KDTree {
    //build tree starting at initial point with depth 0
    constructor(points) {
        this.root = this.buildTree(points, 0);
    }
    //points is all the coordinates inputted into the tree
    //example input = [(1,3),(4,7),(-5,9),(0,5)....]
    buildTree(points, depth) {
        //if there are no points, return null (base case)
        if (points.length === 0) {
            return null;
        }

        //dim is 2 so mod depth of 2 gives current axis
        const axis = depth % 2; // for example if depth is 3, axis is 1 aka longitude (axis of 0 is latitude)

        //sort points along axis
        points.sort((a, b) => a[axis] - b[axis]);

        //reminder that google points are stored in formate {latitude , longitude}
        //example random point click on Google Maps yields 29.776519, -82.401457
        //29°46'35.5"N 82°24'05.3"W
        //N (y-axis) and W (x-axis)

        //find index of median point along current axis
        const medianIndex = Math.floor(points.length / 2);
        // create a new node with media point and current depth
        const node = new Node(points[medianIndex], depth);

        //recursively build left subtree with points before median
        node.left = this.buildTree(points.slice(0,medianIndex), depth + 1);
        //build right subtree with points after median
        node.right = this.buildTree(points.slice(medianIndex + 1), depth + 1);

        return node;
    }

    //nearest neighbor search using recursion
    nearestNeighbor(queryPoint) {
        //initialize variables to store best point (nearest point) along with the best distance
        let best = null;
        let bestDistance = Infinity;

        //recursive function to find nearest neighbor
        //start at root
        searchNearest(this.root, queryPoint, 0);

        //return best node aka nearest neighbor
        return best;

        //math used to convert distance between two lon/lat points into miles
        //same formula used for priority queue algo
        function distanceConversion(point1, point2) {
            // use formula to calculate respective coordinates into radians
            const lat1 = point1[0] * (Math.PI / 180);
            const lon1 = point1[1] * (Math.PI / 180);
            const lat2 = point2[0] * (Math.PI / 180);
            const lon2 = point2[1] * (Math.PI / 180);

            //calculate difference in latitudes and longitudes
            const dlat = lat2 - lat1;
            const dlon = lon2 - lon1;

            //use math formula for distance calculation
            //https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
            const a = Math.sin(dlat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) ** 2;
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            //usa gas stations so using miles for earth radius
            const radius = 3960;

            return radius * c;
        }

        //recursive function
        function searchNearest(node, queryPoint, depth) {
            //base case
            if (node === null) {
                return;
            }
            //get current axis
            const axis = depth % 2;
            //calculate the current distance between the node and query
            const currentDistance = distanceConversion(node.point, queryPoint);
            //if the current distance is less than the best distance
            if (currentDistance < bestDistance) {
                //set the best node to the current node point and best distance to current distance
                best = node.point;
                bestDistance = currentDistance;
            }

            // const nextNode = queryPoint[axis] < node.point[axis] ? node.left : node.right;
            // const otherNode = queryPoint[axis] < node.point[axis] ? node.right : node.left;
            let nextNode, otherNode;
            //if querypoint value at axis is less than the node point at the axis, make the next node left child
            //other node is right because query point is LESS than -> left tree
            if(queryPoint[axis] < node.point[axis]){
                nextNode = node.left;
                otherNode = node.right;
            }else{
                //else choose opposite nodes for next and other because querypoint was greater than node point
                nextNode = node.right;
                otherNode = node.left;
            }
            //recursively search the next node at lower depth
            searchNearest(nextNode, queryPoint, depth + 1);
            //difference between longitude and latitudes can be converted to miles with multiplier
            //one degree of latitude approx 69 miles/ longitude approx 54.6 miles
            let multiplier;
            if (axis === 0){
                multiplier = 69.2;
            }else{
                multiplier = 54.6;
            }
            //if difference in longitude/latitude is less than best distance
            if (Math.abs(queryPoint[axis] - node.point[axis])*multiplier < bestDistance) {
                //explore other node for potentially closer point
                searchNearest(otherNode, queryPoint, depth + 1);
            }
        }
    }
    //nearest neighbor search using priority queue
    nearestNeighborWithPriorityQueue(queryPoint) {
        //constructor for priority queue
        class PriorityQueue {
            //construct as list
            constructor() {
                this.elements = [];
            }
            //enqueue pushing an element along with priority(closest distance)
            enqueue(element, priority) {
                this.elements.push({ element, priority });
                //sorts elements based on priority
                this.elements.sort((a, b) => a.priority - b.priority);
            }
            //removes and returns first element of list
            dequeue() {
                return this.elements.shift();
            }
            //checks if size of list is zero/empty
            isEmpty() {
                return this.elements.length === 0;
            }
        }

        //initialize best node, distance and create pq object
        let best = null;
        let bestDistance = Infinity;
        const priorityQueue = new PriorityQueue();
        //add the root of kd tree to the priority queue
        priorityQueue.enqueue(this.root, 0);

        //same distance function used in nearest neighbor search
        function distanceConversion(point1, point2) {
            //lat and lon in decimal form, no need to convert from deg to rad
            const lat1 = point1[0] * (Math.PI / 180);
            const lon1 = point1[1] * (Math.PI / 180);
            const lat2 = point2[0] * (Math.PI / 180);
            const lon2 = point2[1] * (Math.PI / 180);

            const dlat = lat2 - lat1;
            const dlon = lon2 - lon1;

            const a = Math.sin(dlat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) ** 2;
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            //usa gas stations so using miles for earth radius
            const radius = 3960;

            return radius * c;
        }
        //iterate over priority until its empty
        while (!priorityQueue.isEmpty()) {
            //return first node of pq (one with the closest distance)
            const { element, priority } = priorityQueue.dequeue();
            const node = element;

            //skip null nodes
            if (node === null) {
                continue;
            }
            //get axis current depth and calculate current distance
            const axis = node.depth % 2;
            const currentDistance = distanceConversion(node.point, queryPoint);
            //if current distance is less than best, make best distance the current distance
            if (currentDistance < bestDistance) {
                //make current node best node
                best = node.point;
                bestDistance = currentDistance;
            }

            //early stopping condition, chose radius of 10 miles
            if (bestDistance < 10){
                //stop algorithm once a good enough point is found for program purposes
                //console.log(bestDistance);
                return best;
            }

            let nextNode, otherNode;
            //same logic as in nearest function
            if(queryPoint[axis] < node.point[axis]){
                nextNode = node.left;
                otherNode = node.right;
            }else{

                nextNode = node.right;
                otherNode = node.left;
            }
            //set multiplier to convert lat/long difference to miles
            let multiplier;
            if (axis === 0){
                multiplier = 69.2;
            }else{
                multiplier = 54.6;
            }
            //enqueue both nodes, next node will have higher priority due to shorter distance
            priorityQueue.enqueue(nextNode, Math.abs(queryPoint[axis] - node.point[axis])*multiplier);
            priorityQueue.enqueue(otherNode, Math.abs(queryPoint[axis] - node.point[axis])*multiplier);

        }
        //return best node
        return best;
    }

}
//function for random coordinate bound in the USA to represent gas stations
function getRandomCoordinate() {
    //define the bounding box for the USA
    const usaBoundingBox = {
        minLat: 24.396308,
        maxLat: 49.384358,
        minLon: -125.000000,
        maxLon: -66.934570,
    };

    //generate random latitude and longitude within the bounding box
    const randomLatitude = Math.random() * (usaBoundingBox.maxLat - usaBoundingBox.minLat) + usaBoundingBox.minLat;
    const randomLongitude = Math.random() * (usaBoundingBox.maxLon - usaBoundingBox.minLon) + usaBoundingBox.minLon;
    //return the result as a point of (y,x) (lat,long)
    return [randomLatitude, randomLongitude];
}

//meters to miles function for maps API extension
function meterToMiles(meters){
    return meters * 0.000621371;
}
export function milesToMeters(miles){
    return miles * 1609.34;
}

module.exports = { KDTree, getRandomCoordinate, meterToMiles };
