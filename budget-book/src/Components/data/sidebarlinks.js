import React from 'react';
import { FiShoppingBag } from 'react-icons/fi';
import { MdCreate } from 'react-icons/md';
import {HiOutlineDocumentReport ,HiUserGroup} from 'react-icons/hi'

import { BsFillAlarmFill } from 'react-icons/bs';
import { GrTransaction } from 'react-icons/gr';
import { AiFillFolderAdd } from 'react-icons/ai';
import { FaHistory } from 'react-icons/fa';
import {BsSignpostSplit} from 'react-icons/bs'
 


export const links = [
 
      {
        name: 'New Expense',
        path: 'Budget/new',
        icon: <MdCreate />,
      },
      {
        name: 'Current Expense',
        path: 'Budget/current',
        icon: <FiShoppingBag />,
      },
      {
        name: 'All Expense',
        path: 'Budget/all-budgets',
        icon: <FaHistory />,
      },
     
      {
        name: 'Add Expense',
        path: 'Budget/Add-Expenses',
        icon: <AiFillFolderAdd />,
      },
      {
        name: 'Users',
        path: 'Budget/users',
        icon: <HiUserGroup />,
        isAdminOnly: true,
      },
      
      {
        name: 'Report',
        path: 'Budget/report',
        icon: <HiOutlineDocumentReport />,
      },
      {
        name: 'Reminders',
        path: 'Budget/daily-reminder',
        icon: <BsFillAlarmFill />,
      },
      {
        name: 'Transactions',
        path: 'Budget/transactions',
        icon: <GrTransaction />,
      },
      {
        name: 'BillSplitter ',
        path: 'Budget/Bill-Splitter',
        icon: <BsSignpostSplit />,
      },
      // {
      //   name: 'My Notes ',
      //   path: 'Budget/My-Notes',
      //   icon: <BsSignpostSplit />,
      // },
      {
        name: 'Add Category',
        path: 'Budget/add-category',
        icon: <AiFillFolderAdd />,
        isAdminOnly: true,
      },
      
];


export const Category = [
  {
    label: 'Home Expense',
    value: 'HomeExpense',

  },
  {
    label: 'Entertainment',
    value: 'Entertainment',
  },
  {
    label: 'Daily Living',
    value: 'DailyLiving',
  },
  {
    label: 'Childrean',
    value: 'Childrean',
  },
  {
    label: 'Transportation',
    value: 'Transportation',
  },
  {
    label: 'Health',
    value: 'Health',
  },
  {
    label: 'Saving',
    value: 'Saving',
  },
  {
    label: 'Insurance',
    value: 'Insurance',
  },
  {
    label: 'Education',
    value: 'Education',
  },
  {
    label: 'CHARITY/GIFTS',
    value: 'CHARITYGIFTS',
  },
  {
    label: 'OBLIGATIONS',
    value: 'OBLIGATIONS',
  },
  {
    label: 'SUBSCRIPTIONS',
    value: 'SUBSCRIPTIONS',
  },
  {
    label: 'MISCELLANEOUS',
    value: 'MISCELLANEOUS',
  },
  {
    label: 'pet',
    value: 'pet',
  },
  {
    label: 'other',
    value: 'other',
  },
];

export const subCategory = {
  HomeExpense: [
    { label: "Mortgage/Rent", value: "MortgageRent" },
    { label: "Electricity", value: "Electricity" },
    { label: "Gas/Oil", value: "GasOil" },
    { label: "Water/Sewer/Trash", value: "WaterSewerTrash" },
    { label: "Phone", value: "Phone" },
    { label: "Cable", value: "Cable" },
    { label: "Internet", value: "Internet" },
    { label: "Furnishings/Appliances", value: "FurnishingsAppliances" },
    { label: "Lawn/Garden", value: "LawnGarden" },
    { label: "Maintenance", value: "Maintenance" },
  ],
  Entertainment: [
    { label: "Activities ", value: "Activities" },
    { label: "Books", value: "Books" },
    { label: "Games", value: "Games" },
    { label: "Fun Stuff", value: "FunStuff" },
    { label: "Hobbies", value: "Hobbies" },
    { label: "Media", value: "Media" },
    { label: "Outdoor Recreation", value: "OutdoorRecreation" },
    { label: "Sports", value: "Sports" },
    { label: "Gadgets", value: "Gadgets" },
  ],
  DailyLiving: [
    { label: "Groceries", value: "Groceries" },
    { label: "Personal Supplies", value: "PersonalSupplies" },
    { label: "Clothing", value: "Clothing" },
    { label: "Dining/Eating Out", value: "DiningEatingOuts" },
    { label: "Dry Cleaning", value: "DryCleaning" },
    { label: "Salon / Barber", value: "SalonBarber" },
   
    ],
  Childrean: [
    { label: "Medical ", value: "Medical" },
    { label: "School Fee", value: "SchoolFee" },
    { label: "School Supplies", value: "SchoolSupplies" },
    { label: "Toys/Games", value: "ToysGames" },
 
  ],
  Transportation: [
    { label: "Vehicle Payments", value: "Vehicle Payments" },
    { label: "Fuel", value: "Fuel" },
    { label: "Bus/Taxi/Train Fare", value: "BusTaxiTrainFare" },
    { label: "Registration/License", value: "Registration/License" },
    { label: "Repairs", value: "Repairs" },
  ],
  Health: [
    { label: "Doctor", value: "Doctor/Dentist" },
    { label: "Medicines", value: "Medicines" },
    { label: "Health Club Dues", value: "HealthClubDues" },
    { label: "Emergency", value: "Emergency" },
  ],
  Saving: [
    { label: "Emergency Fund", value: "EmergencyFund" },
    { label: "Sub Option World", value: "suboption World" },
    { label: "Car Replacement Fund", value: "Car Replacement Fund" },
    { label: "Retirement Fund", value: "Retirement Fund" },
    { label: "Investments", value: "Investments" },
    { label: "Education Fund", value: "Education Fund" },


  ],
  Insurance: [
    { label: "Auto", value: "Auto" },
    { label: "Health", value: "Health" },
    { label: "Life", value: "Life" },
    { label: "Home/Rental", value: "Home/Rental" },
  ],
  Education: [
    { label: "Fee", value: "Fee" },
    { label: "Extra Tuition", value: "Extra Tuition" },
  ],
  CHARITYGIFTS: [
    { label: "Gifts Given ", value: "Gifts Given" },
    { label: "Charitable Donations", value: "Charitable Donations" },
    { label: "Religious Donations", value: "Religious Donations" },
  ],
  OBLIGATIONS: [
    { label: "Loans ", value: "Loans" },
    { label: "Credit Card Debt", value: "Credit Card Debt" },
    { label: "Federal Taxes", value: "Federal Taxes"},
    { label: "State/Local Taxes", value: "State/Local Taxes"},
    { label: "Legal Fees", value: "Legal Fees"},
  ],
  pet: [
    { label: "Pet Food ", value: "pet Food" },
    { label: "Pet Medical", value: "pet Medical" },
  ],
  SUBSCRIPTIONS: [
    { label: "Newspaper", value: "Newspaper" },
    { label: "Magazines", value: "Magazines" },
    { label: "Club Memberships", value: "Club Memberships" },
    { label: "Netflix", value: "Netflix" },
    { label: "Amazon Prime", value: "Amazon Prime" },
  ],
  MISCELLANEOUS: [
    { label: "Bank Fees ", value: "Bank Fees" },
    { label: "Postage", value: "Postage" },
  ],
  other: [
    { label: "other", value: "other" },
  ],
};