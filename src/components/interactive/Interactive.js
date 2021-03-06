import React, {useState, useEffect} from 'react';
import {Container, Grid} from "semantic-ui-react";
import {filter} from "lodash";
import { v4 as uuidv4 } from 'uuid';
import './Interactive.css';
import Single from "./single/Single";
import National from "./national/National";
import ControlPanel from "./control-panel/ControlPanel";

import {offsets} from './emission_conversions';
import {getTotalCarbon} from './selectors';

const DEBUG = 0;

function Interactive() {

  const carbonInterfaceToken = "bHsVWXBB9zpHqk9r4XvCw";
  const carbonInterfaceURL = "https://www.carboninterface.com/api/v1/estimates";

  // Emissions
  const [electricity, setElectricity] = useState(0);
  const [flights, setFlights] = useState([]);
  const [cars, setCars] = useState([]);
  const [shipping, setShipping] = useState([]);
  // Offsets
  const [vegan, setVegan] = useState(0);
  const [carFree, setCarFree] = useState(0);
  const [ledBulbs, setLedBulbs] = useState(0);
  const [trees, setTrees] = useState(0);
  // People
  const [people, setPeople] = useState(1);

  function updateElectricity(value) {
    let kwh = parseInt(value * 100 / 11.19 * 12);
    let new_electricity = {
      "type": "electricity",
      "electricity_unit": "kwh",
      "electricity_value": kwh,
      "country": "us",
    }
    if (kwh > 0) {
      setElectricity(100);
      getCarbon(new_electricity)
        .then((carbon) => {
          setElectricity(carbon);
      });
    } else {
      setElectricity(0);
    }

  }

  function updateFlights(flight) {
    if (DEBUG) console.log(flight);
    let new_flight;
    if (flight.oneWayRound === "One Way") {
      new_flight = {
        "type": "flight",
        "passengers": 1,
        "legs": [
          {"departure_airport": flight.from, "destination_airport": flight.to},
        ]
      };
    } else {
      new_flight = {
        "type": "flight",
        "passengers": 1,
        "legs": [
          {"departure_airport": flight.from, "destination_airport": flight.to},
          {"departure_airport": flight.to, "destination_airport": flight.from},
        ]
      };
    }
    if (DEBUG) console.log(new_flight);
    getCarbon(new_flight)
      .then((carbon) => {
        setFlights(flights.concat([{
          id: uuidv4(),
          from: flight.from, "to": flight.to,
          oneWayRound: flight.oneWayRound,
          carbon
        }]))
      });
  }

  function deleteFlight(flight) {
    setFlights(filter(flights, (item) => { return item.id !== flight.id }))
  }

  function updateCars(car) {
    let miles;
    if (car.frequency === "week") {
      miles = car.miles * 52;
    }
    let new_car = {
      "type": "vehicle",
      "distance_unit": "mi",
      "distance_value": miles,
      "vehicle_model_id": "cc5e1c93-2684-4424-afad-40a6b8145761"
    }
    getCarbon(new_car)
      .then((carbon) => {
        setCars(cars.concat([{
          id: uuidv4(),
          miles: car.miles,
          frequency: car.frequency,
          carbon
        }]));
      });
  }

  function deleteCar(car) {
    setCars(filter(cars, (item) => { return item.id !== car.id }))
  }

  function updateShipping(item) {
    let new_item = {
      "type": "shipping",
      "weight_value": item.weight,
      "weight_unit": "lb",
      "distance_value": item.distance,
      "distance_unit": "mi",
      "transport_method": item.method
    };
    if (DEBUG) console.log(new_item);
    getCarbon(new_item)
      .then((carbon) => {
        setShipping(shipping.concat([{
          id: uuidv4(),
          weight: item.weight,
          distance: item.distance,
          method: item.method,
          carbon
        }]));
      });
  }

  function deleteShipping(shipment) {
    setShipping(filter(shipping, (item) => { return item.id !== shipment.id }))
  }

  function updateOffsets(event, data) {
    if (typeof event === "number") {
      // Set trees to event (the number of trees) x whatever constant we use
      setTrees(event * offsets.trees.offset);
    } else {
      switch (data.label) {
        case offsets.vegan.label:
          setVegan(data.checked ? offsets.vegan.offset : 0);
          break;
        case offsets.carFree.label:
          setCarFree(data.checked ? offsets.carFree.offset : 0);
          break;
        case offsets.ledBulbs.label:
          setLedBulbs(data.checked ? offsets.ledBulbs.offset : 0);
          break;
        default:
          break;
      }
    }
  }

  function updatePeople(value) {
    if (value !== 1) {
      setPeople(value - 1);
    } else {
      setPeople(1);
    }
  }

  function getCarbon(json) {
    return fetch(carbonInterfaceURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${carbonInterfaceToken}`
      },
      body: JSON.stringify(json),
    })
      .then(response => response.json())
      .then(data => {
        console.info('@getCarbon data', data);
        return data.data.attributes.carbon_kg
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  useEffect(() => {
    if (DEBUG) {
      console.log("Electricity: " + electricity);
      console.log("Flights: ");
      console.log(flights);
      console.log("Cars: ");
      console.log(cars);
      console.log("Shipping: ");
      console.log(shipping);
      console.log("Vegan: " + vegan);
      console.log("Car Free: " + carFree);
      console.log("LED: " + ledBulbs);
      console.log("Trees: " + trees);
      console.log("People: " + people);
      console.log("------------------------------")
    }
  }, [electricity, flights, shipping, cars, vegan, carFree, ledBulbs, trees, people]);

  const totalCarbon = getTotalCarbon({
    electricity, flights, shipping, cars, vegan, carFree, ledBulbs, trees
  });

  return (
    <Container className="interactive">
      <Grid className="interactive-grid" columns={3}>
        <Grid.Row className="header" stretched>
          <Grid.Column width={5}>
            <h3>Measure Carbon Emissions</h3>
          </Grid.Column>
          <Grid.Column width={11}>
            <h3>Total Carbon Impact</h3>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row className="viz-panels" stretched>
          <Grid.Column width={5}>
            <ControlPanel
              electricity={electricity}
              updateElectricity={updateElectricity}
              flights={flights}
              updateFlights={updateFlights}
              deleteFlight={deleteFlight}
              cars={cars}
              updateCars={updateCars}
              deleteCar={deleteCar}
              shipping={shipping}
              updateShipping={updateShipping}
              deleteShipping={deleteShipping}
              updateOffsets={updateOffsets}
              people={people}
              updatePeople={updatePeople}
            />
          </Grid.Column>
          <Grid.Column width={11}>
            <Single
              electricity={electricity}
              flights={flights}
              cars={cars}
              shipping={shipping}
              vegan={vegan}
              carFree={carFree}
              ledBulbs={ledBulbs}
              trees={trees}
            />
            <National carbon={totalCarbon} people={people} />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
}

export default Interactive;
