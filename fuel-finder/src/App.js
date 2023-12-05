/**
 * Project 3
 * Data Structures and Algorithms
 * Matthew Segura, Brian Borrego, Adrian Lehnhaeuser
 *
 * References for this file:
 * For React UI to Display Google API: https://www.youtube.com/watch?v=iP3DnhCUIsE
 * Github Repo for React UI:https://github.com/trulymittal/google-maps-directions-tutorial.git
 */
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  HStack,
  VStack,
  IconButton,
  Input,
  SkeletonText,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react'


import { FaLocationArrow, FaTimes } from 'react-icons/fa'
import { KDTree, getRandomCoordinate, meterToMiles, milesToMeters } from './kdtree'
import React, { useEffect } from 'react';

import{useLoadScript, GoogleMap, Marker, Autocomplete, DirectionsRenderer,} from '@react-google-maps/api'
import { useRef, useState } from 'react'

const center = {lat:29.650444, lng:-82.342986}

  const coords = [];
  for (let i=0; i < 100000; i++){
      coords[i] = getRandomCoordinate();
  }

  //create tree of coordinates
  const kdTree = new KDTree(coords);
 
  
function App() {
  const {isLoaded} = useLoadScript({
    /*Will be pushed to github without actual key */
    googleMapsApiKey : 'Put your own key',
    libraries: ['places'],

  })
  

  const [selectedAlgorithm, setSelectedAlgorithm] = useState('');

  const handleAlgorithmSelect = (algorithm) => {
    setSelectedAlgorithm(algorithm);
  };
  
  
  const [map, setmap] = useState(/**@type google.maps.Map */(null))
  const [directionsResponse, setDirectionsResponse] = useState(null)
  const [directionsRenderer, setDirectionsRenderer] = useState(null)
  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')
  const [algorithmTime, setAlgorithmTime] = useState('');
  const [gasStations, setGasStations] = useState([])
  const [centerMarker, setCenterMarker] = useState(null)
  let elapsedTime = 0;
  

  /**@type React.MutableRefObject<HTMLInputElement> */
  const originRef = useRef()
  /**@type React.MutableRefObject<HTMLInputElement> */
  const destinationRef = useRef()
  /**@type React.MutableRefObject<HTMLInputElement> */
  const currentRangeRef = useRef()
  /**@type React.MutableRefObject<HTMLInputElement> */
  const maxRangeRef = useRef()

  useEffect(() => {
    const initMap = async () => {
      if (isLoaded) {
        try {
          const epolyModule = await import('./epoly.js');
          console.log('epoly.js has been loaded');
        } catch (error) {
          console.error('Error loading epoly.js:', error);
        }
      } else {
        setTimeout(initMap, 100);
      }
    };
  

    initMap();
    return () => {
      
    };
  }, [isLoaded]);

  if(!isLoaded){
    return <SkeletonText />
  }
 
  

  

  const calculateRoute = async () => {
    if (originRef.current.value === '' || destinationRef.current.value === '' || currentRangeRef.current.value === '' || maxRangeRef.current.value === '') {
      return;
    }
    const startTime = performance.now();
    console.log('calculateRoute called');
    // eslint-disable-next-line no-undef
    const directionsService = new google.maps.DirectionsService();
    const origin = originRef.current.value;
    const destination = destinationRef.current.value;
    const currentRange = currentRangeRef.current.value;
    const maxRange = maxRangeRef.current.value;

    const waypoints = [];
    await calculateSegment(origin, destination, waypoints,origin, currentRange,maxRange,true);
    const waypointsWithNeighbors = await Promise.all(
      waypoints.map(async (waypoint) => {
        const nearestNeighbor = await getNearestNeighbor(waypoint.location);
        return {
          // eslint-disable-next-line no-undef
          location: new google.maps.LatLng(nearestNeighbor[0], nearestNeighbor[1]),
          stopover: true,
        };
      })
    );
  
    displayRoute(origin, destination, waypointsWithNeighbors);
    // eslint-disable-next-line no-undef
    
    const results = await directionsService.route({
      origin: originRef.current.value,
      destination: destinationRef.current.value,
      // eslint-disable-next-line no-undef
      travelMode: google.maps.TravelMode.DRIVING,
    })
    setDirectionsResponse(results)
    setDistance(results.routes[0].legs[0].distance.text)
    setDuration(results.routes[0].legs[0].duration.text)
    const endTime = performance.now();
    elapsedTime = endTime-startTime;
    setAlgorithmTime(elapsedTime);
   
  };
  const getNearestNeighbor = async (point) => {
    return new Promise((resolve) => {
      // Start measuring time
      
      let nearestNeighbor;
      console.log('Neighbor called');
      if (selectedAlgorithm === 'Nearest Neighbor-Normal') {
        console.log('pick 1');
        nearestNeighbor = kdTree.nearestNeighbor(point);

      } else if (selectedAlgorithm === 'Nearest Neighbor-Priority Queue') {
        console.log('pick 2');
        nearestNeighbor = kdTree.nearestNeighborWithPriorityQueue(point);
        
      }
      // Resolve with both the nearestNeighbor and the measured time
      resolve({ nearestNeighbor});
    });
  };
  
  
  
  const calculateSegment = (start, end, waypoints,initialStart, currRange, maxRange, firstPass ) => {
    // eslint-disable-next-line no-undef
    const directionsService = new google.maps.DirectionsService();
    console.log('calculateSegment called');
    directionsService.route(
      {
        origin: start,
        destination: end,
        travelMode: 'DRIVING',
      },
       async (response, status) => {
        if (status === 'OK') {
          
          // eslint-disable-next-line no-undef
          const polyline = new google.maps.Polyline({ path: response.routes[0].overview_path });
          let point;
            if (firstPass) {
                point = polyline.GetPointAtDistance(milesToMeters(currRange));
            } else {
                point = polyline.GetPointAtDistance(milesToMeters(maxRange));
            }

          if (point) {
              waypoints.push({
              location: point,
              stopover: true,
            });
            // Recursively calculate the next segment
            calculateSegment(point, end, waypoints, initialStart, maxRange, maxRange, false);
          } else {
            // No more points at 300 miles, display the final route
            displayRoute(initialStart, end, waypoints);
          }
        } else {
          window.alert('Directions request failed due to ' + status);
        }
      }
    );
  };
  const displayRoute = (start, end, waypoints) => {
    console.log('displayRoute called');
    // eslint-disable-next-line no-undef
    const directionsService = new google.maps.DirectionsService();
    const origin = start;
    const destination = end;

    directionsService.route(
      {
        origin: origin,
        destination: destination,
        waypoints: waypoints,
        travelMode: 'DRIVING',
      },
      (response, status) => {
        if (status === 'OK') {
          if (directionsRenderer) {
            directionsRenderer.setDirections(response);
          }
        } else {
          window.alert('Directions request with waypoints failed due to ' + status);
        }
      }
    );
  };

  const handleMapLoad = (map) => {
    setmap(map);
    console.log('maploaded called');
    // Create a new DirectionsRenderer when the map loads
    if (!directionsRenderer) {
      // eslint-disable-next-line no-undef
      const newDirectionsRenderer = new google.maps.DirectionsRenderer();
      newDirectionsRenderer.setMap(map);
      setDirectionsRenderer(newDirectionsRenderer);
    }
  };
 

  function clearRoute() {
      setDirectionsResponse(null)
      setDistance('')
      setDuration('')
      originRef.current.value = ''
      destinationRef.current.value = ''
  }

 


  return (
    <Flex
      position='relative'
      flexDirection='column'
      alignItems='center'
      h='100vh'
      w='100vw'
    >
      <Box position='absolute' left={0} top={0} h='100%' w='100%'>
        {/* Google Map Box*/}
        <GoogleMap 
            center={center} 
            zoom={15} 
            mapContainerStyle={{ width: '100%', height: '100%' }}
            options={{
              streetViewControl: false,
               mapTypeControl: false, 
            }}
            onLoad={(map)=> handleMapLoad(map)}
          >
           
            {/* Displaying markers or directions */}
            {!directionsResponse && <Marker position={center} />}
            {directionsResponse && (
              <DirectionsRenderer directions={directionsResponse} />
            )}
          </GoogleMap>

      </Box>

      <Box
        p={4}
        borderRadius='lg'
        m={4}
        bgColor='white'
        shadow='base'
        minW='container.md'
        zIndex='1'
      >
        <HStack spacing={2} justifyContent='space-between'>
        <Box flexGrow={1}>
            <Autocomplete>
              <Input type='text' placeholder='Origin' ref={originRef} />
            </Autocomplete>
          </Box>
          <Box flexGrow={1}>
            <Autocomplete>
              <Input
                type='text'
                placeholder='Destination'
                ref={destinationRef}
              />
            </Autocomplete>
          </Box>
          <ButtonGroup>
            <Button colorScheme='blue' type='submit' onClick={calculateRoute}>
              Calculate Route
            </Button>
            <IconButton
              aria-label='center back'
              icon={<FaTimes />}
              onClick={clearRoute}
            />
          </ButtonGroup>
        </HStack>
        <HStack spacing={0.5} mt={4} justifyContent='space-between'>
        <VStack align="start">
          <Box flexGrow={1}>
        
                <Input
                  type='text'
                  placeholder='Current Range(mi)'
                  ref={currentRangeRef}
                  size='sm'
                  w='85%'
                />
                
              
            </Box>
            <Box flexGrow={1}>
            
                <Input
                  type='text'
                  placeholder='Max Rang(mi)'
                  ref={maxRangeRef}
                  size='sm'
                  w='85%'
                />
            
            </Box>
          </VStack>
          
          <VStack align="start">
            <Menu>
              <MenuButton 
                as={Button}
                colorScheme="blue"
                variant="outline"
                size="sm">
                Algorithms
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => handleAlgorithmSelect('Nearest Neighbor-Normal')}>
                  Nearest Neighbor-Normal
                </MenuItem>
                <MenuItem onClick={() => handleAlgorithmSelect('Nearest Neighbor-Priority Queue')}>
                  Nearest Neighbor-Priority Queue
                </MenuItem>
              </MenuList>
            </Menu>
            <Text mt={0.5} fontSize={14}>Selected Algorithm: {selectedAlgorithm}</Text>
            <Text mt={0.5} fontSize={14}>Algorithm Time:{algorithmTime} </Text>
          </VStack>

          <VStack align="start" mr = {150} >
            <Text>Distance: {distance}</Text>
            <Text>Duration: {duration}</Text>
          </VStack>
         
        </HStack>
      </Box>
    </Flex>
  )
}

export default App
