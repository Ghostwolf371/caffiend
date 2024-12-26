import { useState } from "react";
import { coffeeOptions } from "../utils";
import Modal from "./Modal";
import Authentication from "./Authentication";
import { useAuth } from "../context/AuthContext";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";

const CoffeeForm = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  const [selectedCoffee, setSelectedCoffee] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCoffeeTypes, setShowCoffeeTypes] = useState<boolean>(false);
  const [coffeeCost, setCoffeeCost] = useState(0);
  const [hour, setHour] = useState(0);
  const [min, setMin] = useState(0);

  const { globalData, setGlobalData, globalUser } = useAuth();

  const handleSubmitForm = async () => {
    if (!isAuthenticated) {
      setShowModal(true);
      return;
    }

    // define a guard clause that only submits the form if it is completed
    if (!selectedCoffee) {
      return;
    }

    try {
      // then we're going to create a new data object
      const newGlobalData = {
        ...(globalData || {}),
      };

      const nowTime = Date.now();
      const timeToSubtract = hour * 60 * 60 * 1000 + min * 60 * 1000;
      const timestamp = nowTime - timeToSubtract;

      const newData = {
        name: selectedCoffee,
        cost: coffeeCost,
      };
      newGlobalData[timestamp] = newData;
      // console.log(timestamp, selectedCoffee, coffeeCost);

      // update the global state
      setGlobalData(newGlobalData);
      // persist the data in the firebase firestore
      const userRef = doc(db, "users", globalUser!.uid);
      const res = await setDoc(
        userRef,
        {
          [timestamp]: newData,
        },
        { merge: true }
      );
      setSelectedCoffee(null);
      setHour(0);
      setMin(0);
      setCoffeeCost(0);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.log(err.message); // Accessing the message
      } else {
        console.log("An unknown error occurred");
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <>
      {showModal && (
        <Modal handleCloseModal={handleCloseModal}>
          <Authentication handleCloseModal={handleCloseModal} />
        </Modal>
      )}
      <div className="section-header">
        <i className="fa-solid fa-pencil"></i>
        <h2>Start tracking Today</h2>
      </div>
      <h4>Select coffee type</h4>
      <div className="coffee-grid">
        {coffeeOptions.slice(0, 5).map((option, optionIndex) => (
          <button
            onClick={() => {
              setSelectedCoffee(option.name);
              setShowCoffeeTypes(false);
            }}
            className={
              "button-card " +
              (option.name == selectedCoffee ? "coffee-button-selected" : "")
            }
            key={optionIndex}
          >
            <h4>{option.name}</h4>
            <p>{option.caffeine}</p>
          </button>
        ))}
        <button
          onClick={() => {
            setShowCoffeeTypes(true);
            setSelectedCoffee(null);
          }}
          className={
            "button-card " + (showCoffeeTypes ? "coffee-button-selected" : "")
          }
        >
          <h4>Other</h4>
          <p>n/a</p>
        </button>
      </div>
      {showCoffeeTypes && (
        <select
          onChange={(e) => {
            setSelectedCoffee(e.target.value);
          }}
          name="coffee-list"
          id="coffee-list"
        >
          <option value={undefined}>Select type</option>
          {coffeeOptions.map((option, optionIndex) => (
            <option value={option.name} key={optionIndex}>
              {option.name} ({option.caffeine}mg)
            </option>
          ))}
        </select>
      )}
      <h4>Add the cost ($)</h4>
      <input
        type="number"
        className="w-full"
        placeholder="4.50"
        value={coffeeCost > 0 ? coffeeCost : ""}
        onChange={(e) => {
          setCoffeeCost(Number(e.target.value));
        }}
      />
      <h4>Time since consumptions</h4>
      <div className="time-entry">
        <div>
          <h6>Hours</h6>
          <select
            onChange={(e) => {
              setHour(Number(e.target.value));
            }}
            value={hour}
            name="hours-select"
            id="hours-select"
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option value={i} key={i}>
                {i}
              </option>
            ))}
          </select>
        </div>
        <div>
          <h6>Mins</h6>
          <select
            onChange={(e) => {
              setMin(Number(e.target.value));
            }}
            value={min}
            name="mins-select"
            id="mins-select"
          >
            {Array.from({ length: 12 }, (_, i) => i * 5).map((min) => (
              <option value={min} key={min}>
                {min}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button onClick={handleSubmitForm}>
        <p>Add Entry</p>
      </button>
    </>
  );
};
export default CoffeeForm;
