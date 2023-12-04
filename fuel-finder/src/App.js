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

import{useLoadScript, GoogleMap, Marker, Autocomplete, DirectionsRenderer,} from '@react-google-maps/api'
import { useRef, useState } from 'react'

const center = {lat:29.650444, lng:-82.342986}

function App() {
  const {isLoaded} = useLoadScript({
    /*Will be pushed to github without actual key */
    googleMapsApiKey : 'Get you own key!',
    libraries: ['places'],

  })

  const [selectedAlgorithm, setSelectedAlgorithm] = useState('');

  const handleAlgorithmSelect = (algorithm) => {
    setSelectedAlgorithm(algorithm);
  };
  
  const [map, setmap] = useState(/**@type google.maps.Map */(null))
  const [directionsResponse, setDirectionsResponse] = useState(null)
  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')

  /**@type React.MutableRefObject<HTMLInputElement> */
  const originRef = useRef()
  /**@type React.MutableRefObject<HTMLInputElement> */
  const destinationRef = useRef()
  /**@type React.MutableRefObject<HTMLInputElement> */
  const currentRangeRef = useRef()
  /**@type React.MutableRefObject<HTMLInputElement> */
  const maxRangeRef = useRef()

  if(!isLoaded){
    return <SkeletonText />
  }
  async function calculateRoute(){
    if(originRef.current.value === '' || destinationRef.current.value ===''){
      return
    }
    // eslint-disable-next-line no-undef
    const directionsService = new google.maps.DirectionsService()
    const results = await directionsService.route({
      origin: originRef.current.value,
      destination: destinationRef.current.value,
      // eslint-disable-next-line no-undef
      travelMode: google.maps.TravelMode.DRIVING,
    })
    setDirectionsResponse(results)
    setDistance(results.routes[0].legs[0].distance.text)
    setDuration(results.routes[0].legs[0].duration.text)
  }

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
            onLoad={(map)=> setmap(map)}
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
                  placeholder='Current Range'
                  ref={currentRangeRef}
                  size='sm'
                  w='70%'
                />
                
              
            </Box>
            <Box flexGrow={1}>
            
                <Input
                  type='text'
                  placeholder='Max Range'
                  ref={maxRangeRef}
                  size='sm'
                  w='70%'
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
            <Text mt={0.5} fontSize={14}>Algorithm Time: </Text>
          </VStack>

          <VStack align="start" mr={150}>
            <Text>Distance: {distance}</Text>
            <Text>Duration: {duration}</Text>
          </VStack>
         
        </HStack>
      </Box>
    </Flex>
  )
}

export default App
