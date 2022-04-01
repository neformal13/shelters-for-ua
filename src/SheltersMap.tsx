import * as React from 'react'
import Map, { FullscreenControl, GeolocateControl, NavigationControl, Popup, Marker } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import SheltersLayers from './SheltersLayers'
import ShelterDetails from './ShelterDetails'
import cluster from './icons/cluster.png'
import family from './icons/family.png'
import familyChild from './icons/family-child.png'
import familyPet from './icons/family-pet.png'
import familyPetChild from './icons/family-pet-child.png'
import './SheltersMap.css'
import BEM from './helpers/BEM'
import { useAsync } from 'react-use'
import { useCallback } from 'react'

const b = BEM('SheltersMap')

export const mapId = 'sheltersMap'

const SheltersMap = ({ geoJSON, selectedShelter, onSelect, onBoundsChange }) => {
  const selectedShelterInfo = useAsync<any>(async () => {
    if (!selectedShelter) return null

    const response = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/shelters/${selectedShelter.id}`)

    if (response.status === 200) {
      return response.json()
    } else {
      throw new Error('Error fetching shelter')
    }
  }, [selectedShelter])

  return (
    <Map
      id={mapId}
      trackResize={true}
      onMoveEnd={({ target: map }) => onBoundsChange(map.getBounds())}
      onLoad={(e) => {
        onBoundsChange(e.target.getBounds())
      }}
      mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
      reuseMaps={true}
      initialViewState={{
        longitude: selectedShelter ? selectedShelter.longitude : 26.17,
        latitude: selectedShelter ? selectedShelter.latitude : 44.38,
        zoom: selectedShelter ? 10 : 4,
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/streets-v9"
    >
      <FullscreenControl />
      <NavigationControl />
      <GeolocateControl />

      <SheltersLayers geoJSON={geoJSON} onSelect={onSelect} />

      {selectedShelter && (
        <>
          <Marker longitude={selectedShelter.longitude} latitude={selectedShelter.latitude} anchor="bottom">
            <span className={b('marker', { loading: selectedShelterInfo.loading })}>
              <span className={b('marker-text')}>{selectedShelter.hawManyPeopleCanHost}</span>
              <img
                className={b('marker-img')}
                src={
                  // prettier-ignore
                  (selectedShelter.kidsFriendly && selectedShelter.petFriendly) ? familyPetChild
                    : selectedShelter.kidsFriendly ? familyChild
                      : selectedShelter.petFriendly ? familyPet
                        : family
                }
              />
            </span>
          </Marker>

          {!selectedShelterInfo.loading && selectedShelterInfo.value && (
            <Popup
              className={b('popup')}
              closeButton={false}
              closeOnClick={false}
              closeOnMove={false}
              key={selectedShelter?.id}
              offset={{
                top: [3, 18],
                'top-left': [3, 18],
                'top-right': [3, 18],
                bottom: [3, -18],
                'bottom-left': [3, -18],
                'bottom-right': [3, -18],
                right: [-15, 0],
                left: [
                  // prettier-ignore
                  (selectedShelter.petFriendly && selectedShelter.kidsFriendly) ? 75
                    : (selectedShelter.petFriendly || selectedShelter.kidsFriendly) ? 65
                      : 50,
                  0,
                ],
              }}
              longitude={selectedShelter.longitude}
              latitude={selectedShelter.latitude}
            >
              <button className={b('close-button')} onClick={() => onSelect(null)}>
                ✕
              </button>

              {selectedShelterInfo.error ? (
                <div className={b('error')}>
                  <span>{selectedShelterInfo.error?.message}</span>
                </div>
              ) : (
                <ShelterDetails shelter={selectedShelterInfo.value} />
              )}
            </Popup>
          )}
        </>
      )}
    </Map>
  )
}

export default SheltersMap