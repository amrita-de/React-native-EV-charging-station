import { View, Text, StatusBar, StyleSheet,ActivityIndicator } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import AppMapView from "./AppMapView";
import Header from "./Header.jsx";
import SearchBar from "./SearchBar.jsx";
import { UserLocationContext } from "../../Context/UserLocationContext";
import GlobalApi from "../../Utils/GlobalApi.js";
import PlaceListView from "./PlaceListView";
import { SelectMarkerContext } from '../../Context/SelectMarkerContext'

export default function HomeScreen() {
  const [selectedMarker,setSelectedMarker]=useState(0);
  const { location, setLocation, usingDefaultLocation } = useContext(UserLocationContext);
  useEffect(()=>{
    setSelectedMarker(0)
    location&&GetNearByPlace();
  },[location])
  const [placeList,setPlaceList] = useState()

  const GetNearByPlace = () => {
    const data = {
      "includedTypes": ["electric_vehicle_charging_station"],
      "maxResultCount": 10,
      "locationRestriction": {
      "circle": {
      "center": {
      "latitude": location?.latitude,
      "longitude": location?.longitude
      },
      "radius": 50000.0
      }
      }
    }
    GlobalApi.NewNearByPlace(data)
      .then((resp) => {
        if (resp) {
          setPlaceList(resp.data?.places);
        } else {
          console.error(
            "Error fetching nearby places: Response data is undefined"
          );
        }
      })
      .catch((error) => {
        console.error("Error fetching nearby places:", error);
      });
  };

  return (
    <SelectMarkerContext.Provider value={{selectedMarker,setSelectedMarker}}>
    <View>
      <View style={styles.headerContainer}>
        <Header />
        <SearchBar 
        searchedLocation={(location) => 
        setLocation({
          latitude:location.lat,
          longitude:location.lng
        })} />
        {usingDefaultLocation && (
          <Text style={styles.defaultLocationBanner}>
            Location permission is off - showing a default area. Enable location to see stations near you.
          </Text>
        )}
      </View>
      {!placeList?   <View style={styles.activityIndicatorContainer}>
      <ActivityIndicator size={'large'} />
    </View>
      
      : <AppMapView placeList={placeList}/>}
      <View style={styles.placeListContainer}>
        {placeList&&<PlaceListView placeList={placeList} />}
      </View>
    </View>
    </SelectMarkerContext.Provider>
  );
}
const styles = StyleSheet.create({
  headerContainer: {
    position: "absolute",
    zIndex: 10,
    padding: 10,
    width: "100%",
    paddingHorizontal: 20,
  }, placeListContainer: {
    position:'absolute',
    zIndex:10,
    bottom:0,
    width:'100%'
  }, defaultLocationBanner: {
    marginTop: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFF4CE',
    color: '#5c4a00',
    fontFamily: 'Raleway-Regular',
    fontSize: 13,
  },   activityIndicatorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width:'100%'
  },
});
