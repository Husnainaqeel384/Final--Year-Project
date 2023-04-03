import React, { useState, useEffect,useCallback } from 'react';
// import classNames from 'classnames';
import { BiEditAlt } from 'react-icons/bi'
import { RiDeleteBin6Line } from 'react-icons/ri'
import Axios from 'axios';
import { server } from '../../../store';

const Category = ({ category, onDelete, onEdit }) => {
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(category.name);
    const [subCategories, setSubCategories] = useState([]);
    const handleEdit = () => {
        setEditing(true);
    };

    const handleSave = () => {
        onEdit(category.id, name);
        setEditing(false);
    };

    const handleCancel = () => {
        setName(category.name);
        setEditing(false);
    };

    const handleDelete = () => {
        onDelete(category.id);
    };

    const handleNameChange = (event) => {
        setName(event.target.value);
    };
    const getSubCategories =useCallback( async () => {
        try {
            let token = localStorage.getItem('token')

            const { data } = await Axios(`${server}/getsubCategories`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-type': 'application/json',
                    'authorization': `Bearer ${token}`
                }
            })
            const filteredSubcategories = data.subCategories.filter(subcategory => subcategory.category_id === category.category_id);
            setSubCategories(filteredSubcategories);

        } catch (error) {

        }
    }, [category.category_id])
    useEffect(() => {
        getSubCategories()
    }, [getSubCategories])
    return (
        <>

            <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <div className="font-bold">{category.category_name}</div>
                    <div className="flex items-center space-x-2">
                        <button
                            className="px-2 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
                            onClick={handleEdit}
                        >
                            Edit
                        </button>
                        <button
                            className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                            onClick={handleDelete}
                        >
                            Delete
                        </button>
                    </div>
                </div>
                {editing ? (
                    <div className="mt-4">
                        <label htmlFor="name" className="block font-bold">
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            className="border border-gray-400 rounded-md px-2 py-1 w-full"
                            value={name}
                            onChange={handleNameChange}
                        />
                        <div className="mt-4 flex justify-end">
                            <button
                                className="px-2 py-1 bg-gray-200 rounded-md hover:bg-gray-300 mr-2"
                                onClick={handleCancel}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                onClick={handleSave}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="mt-4">
                      
                        {subCategories.map((subcategory) => (
                            <div key={subcategory.subCategory_id} className="ml-4 flex justify-between space-x-2">
                              {
                                    subcategory.category_id === category.category_id ? (
                                        <div className="font-bold">{subcategory.subCategoryName}</div>
                                    ) : "null"
                              }
                                <div>
                                    <button onClick={() => { }} 
                                    className="px-2 py-1  rounded-md  text-blue-300"> <BiEditAlt />  </button>
                                    <button className="px-2 py-1  rounded-md text-red-600"><RiDeleteBin6Line /> </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </>
    );
};

const Categories = () => {

    const [ismainCategory, setMainCategory] = useState(false)
    const [isSubCategory, setSubCategory] = useState(false)
    const [mainCategories, setMainCategories] = useState([]);
    
   
    const getCategories = async () => {
        try {
            let token = localStorage.getItem('token')
            const { data } = await Axios.get(`${server}/getCategories`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-type': 'application/json',
                    'authorization': `Bearer ${token}`

                }
            })

            setMainCategories(data.categories)
        } catch (error) {

        }
    }
    useEffect(() => {
        getCategories()
    }, [])
    return (
        <>
            <div className="max-w-md mx-auto mt-2">
                {
                    ismainCategory ? (
                        <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                            <h2 className="text-xl font-bold mb-4">Add Main Category</h2>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-bold mb-2" htmlFor="mainCategory">
                                    Main Category
                                </label>
                                <input
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="mainCategory"
                                    type="text"
                                    placeholder="Enter main category"
                                // value={mainCategory}
                                // onChange={(event) => setMainCategory(event.target.value)}
                                />
                            </div>
                            <button onClick={() => setMainCategory(false)}
                                className="bg-gray-100 text-gray-700 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
                                Cancel
                            </button>
                            <button className="bg-blue-500 ml-5 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
                                Add Main Category
                            </button>
                        </form>
                    ) : ""
                }
                {
                    isSubCategory ? (
                        <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                            <h2 className="text-xl font-bold mb-4">Add Subcategory</h2>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-bold mb-2" htmlFor="subCategory">
                                    Subcategory
                                </label>
                                <input
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="subCategory"
                                    type="text"
                                    placeholder="Enter subcategory"
                                // value={subCategory}
                                // onChange={(event) => setSubCategory(event.target.value)}
                                />
                            </div>
                            <button onClick={() => setSubCategory(false)}
                                className="bg-gray-100 text-gray-700 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
                                Cancel
                            </button>
                            <button className="bg-blue-500 hover:bg-blue-700 ml-5 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
                                Add Subcategory
                            </button>
                        </form>
                    ) : ""
                }
            </div>
            <div className="p-4">
                <div className="flex justify-between items-center">
                    <div className="font-bold text-2xl">Categories</div>
                    <div >
                        <button className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            onClick={() => {
                                setMainCategory(true)
                                setSubCategory(false)
                            }}
                        >
                            Add Category
                        </button>
                        <button className=" ml-2 px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            onClick={() => {
                                setSubCategory(true)
                                setMainCategory(false)
                            }
                            }
                        >
                            Add Sub Category
                        </button>
                    </div>
                </div>
                <div className="mt-4">
                    {mainCategories.map((category) => (
                        <Category
                            key={category.category_id}
                            category={category}
                        />
                    ))}
                </div>
            </div>
        </>
    );
};

export default Categories;