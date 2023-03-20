import React, { createContext, useContext, useState } from 'react';

const StateContext = createContext();

const initialState = {
  //   chat: false,
  //   cart: false,
  userProfile: false,
  //   notification: false,
};

export const ContectProvider = ({ children }) => {

  const [activeMenu, setactiveMenu] = useState(true)
  const [isClicked, setIsClicked] = useState(initialState);
  const [screenSize, setScreenSize] = useState(undefined)
  const [userProfileId, setUserProfileId] = useState(0)
  const [userProfileFirstName, setUserProfileFirstName] = useState('')
  const [userProfileLastName, setUserProfileLastName] = useState('')
  const [userProfileUserName, setUserProfileUserName] = useState('')
  const [userProfilemail, setUserProfileEmail] = useState('')
  const [opendrop, setOpenDrop] = useState(false)
  const [openExpenseDropdown, setopenExpenseDropdown] = useState(false)
  const [openDailyExpense, setopenDailyExpense] = useState(false)
  const handleClick = (clicked) => {
    setIsClicked({ ...initialState, [clicked]: true })
  }

  return (
    <StateContext.Provider
      value={{
        activeMenu,
        isClicked,
        screenSize,
        opendrop,
        userProfileId,
        userProfileFirstName,
        userProfileLastName,
        userProfileUserName,
        userProfilemail,
        openExpenseDropdown,
        openDailyExpense,
        setactiveMenu,
        setIsClicked,
        setScreenSize,
        handleClick,
        setOpenDrop,
        setUserProfileId,
        setUserProfileFirstName,
        setUserProfileLastName,
        setUserProfileUserName,
        setUserProfileEmail,
        setopenExpenseDropdown,
        setopenDailyExpense,

      }}
    >
      {children}
    </StateContext.Provider>
  )
}
export const useStateContext = () => useContext(StateContext)