import React, { useState, useEffect } from 'react';
// import classNames from 'classnames';
import { BiEditAlt } from 'react-icons/bi'
import { RiDeleteBin6Line } from 'react-icons/ri'
import Axios from 'axios';
import { server } from '../../../store';
import { toast } from 'react-toastify'

const Categories = () => {

    const [ismainCategory, setMainCategory] = useState(false)
    const [isSubCategory, setSubCategory] = useState(false)
    const [mainCategories, setMainCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [isUpdate, setUpdate] = useState(false);
    const [isupdatesubCategory, setisUpdateSubCategory] = useState(false);
    const [maincategoryValue, setMainCategoryValue] = useState('');
    const [maincategoryId, setMainCategoryId] = useState('');
    const [subCategoryId,setSubCategoryId] = useState('');
    const [subCategoryValue, setSubCategoryValue] = useState('');
    const editMainCategory = (id, name) => {
        setMainCategory(true)
        setMainCategoryValue(name);
        setUpdate(true);
        setMainCategoryId(id);
        window.scrollTo(0, 0);
    
    }
    const AddMainCategroy = async () => {
        try {
            let token = localStorage.getItem('token')
            const { data } = await Axios.post(`${server}/addCategory`, {
                name: maincategoryValue
            }, {
                headers: {
                    'Accept': 'application/json',
                    'Content-type': 'application/json',
                    'authorization': `Bearer ${token}`
                }
            })
            toast.success(data.message, { position: toast.POSITION.TOP_CENTER })
            setMainCategory(false)
            setMainCategoryValue('')
            getCategories()
        } catch (error) {
            console.log(error);
        }
    }
    const scrolltop = () => {
        window.scrollTo(0, 0);
    }
    const UpdateMainCategory = async () => {
        try {
            let token = localStorage.getItem('token')
            const { data } = await Axios.put(`${server}/updateCategory/${maincategoryId}`, {
                name: maincategoryValue
            }, {
                headers: {
                    'Accept': 'application/json',
                    'Content-type': 'application/json',
                    'authorization': `Bearer ${token}`
                }
            })
            toast.success(data.message, { position: toast.POSITION.TOP_CENTER })
            setMainCategory(false)
            setMainCategoryValue('')
            getCategories()
           

        } catch (error) {

        }
    }
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
    const getSubCategories = async () => {
        try {
            let token = localStorage.getItem('token')

            const { data } = await Axios(`${server}/getsubCategories`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-type': 'application/json',
                    'authorization': `Bearer ${token}`
                }
            })
            // const filteredSubcategories = data.subCategories.filter(subcategory => subcategory.category_id === mainCategories.category_id);
            // setSubCategories(filteredSubcategories);
            setSubCategories(data.subCategories)
        } catch (error) {

        }
    }
    const deleteMainCategory = async (id) => {
        try {
            let token = localStorage.getItem('token')
            const { data } = await Axios.delete(`${server}/deleteCategory/${id}`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-type': 'application/json',
                    'authorization': `Bearer ${token}`
                }
            })
            toast.success(data.message, { position: toast.POSITION.TOP_CENTER })
            getCategories()
        } catch (error) {
            toast.error(error.response.data.message, { position: toast.POSITION.TOP_CENTER })
        }
    }
    const UpdateSubCategory = async () => {
        try {
            let token = localStorage.getItem('token')
            const { data } = await Axios.put(`${server}/updateSubCategory/${subCategoryId}`, {
                name: subCategoryValue,
                category_id: maincategoryId
            }, {
                headers: {
                    'Accept': 'application/json',
                    'Content-type': 'application/json',
                    'authorization': `Bearer ${token}`
                }
            })
            toast.success(data.message, { position: toast.POSITION.TOP_CENTER })
            setMainCategoryId('')
            setSubCategoryValue('')
            setSubCategory(false)
            getCategories()
         
            getSubCategories()
       
        } catch (error) {

        }
    }
    const AddSubCategory = async () => {
        try {
            let token = localStorage.getItem('token')
            const { data } = await Axios.post(`${server}/addSubCategory`, {
                name: subCategoryValue,
                category_id: maincategoryId
            }, {
                headers: {
                    'Accept': 'application/json',
                    'Content-type': 'application/json',
                    'authorization': `Bearer ${token}`
                }
            })
            toast.success(data.message, { position: toast.POSITION.TOP_CENTER })
            setSubCategory(false)
            setSubCategoryValue('')
            getSubCategories()
        } catch (error) {
            console.log(error);
        }
    }
    const deleteSubCategory = async (id) => {
        try {
            let token = localStorage.getItem('token')
            const { data } = await Axios.delete(`${server}/deleteSubCategory/${id}`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-type': 'application/json',
                    'authorization': `Bearer ${token}`
                }
            })
            toast.success(data.message, { position: toast.POSITION.TOP_CENTER })
            getSubCategories()
        } catch (error) {
            toast.error(error.response.data.message, { position: toast.POSITION.TOP_CENTER })
        }
    }
    useEffect(() => {
        getSubCategories()
    }, [])
    useEffect(() => {
        getCategories()
    }, [])
    return (
        <>
            <div className="max-w-md mx-auto mt-2">
                {
                    ismainCategory ? (
                        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                            {
                                isUpdate ? (
                                    <h2 className="text-xl font-bold mb-4">Update Category</h2>
                                ) : (
                                    <h2 className="text-xl font-bold mb-4">Add Category</h2>
                                )
                            }
                            <div className="mb-4">
                                <label className="block text-gray-700 font-bold mb-2" htmlFor="mainCategory">
                                    Main Category
                                </label>
                                <input
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="mainCategory"
                                    type="text"
                                    placeholder="Enter main category"
                                    value={maincategoryValue}
                                    onChange={(e) => {
                                        setMainCategoryValue(e.target.value)
                                    }
                                    }
                                />
                            </div>
                            <button onClick={() => {
                                setUpdate(false)
                                setMainCategory(false)
                                setMainCategoryValue('')
                            }}
                                className="bg-gray-100 text-gray-700 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
                                Cancel
                            </button>
                            {
                                isUpdate ? (
                                    <button onClick={UpdateMainCategory}
                                        className="bg-blue-500 hover:bg-blue-700 ml-5 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
                                        Update Category
                                    </button>
                                ) : (
                                    <button onClick={AddMainCategroy}
                                        className="bg-blue-500 ml-5 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
                                        Add Main Category
                                    </button>
                                )
                            }
                        </div>
                    ) : ""
                }
                {
                    isSubCategory ? (
                        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                            {
                                isupdatesubCategory ? (
                                    <h2 className="text-xl font-bold mb-4">Update Subcategory</h2>
                                ) : (
                                    <h2 className="text-xl font-bold mb-4">Add Subcategory</h2>
                                )
                            }

                            <div className="mb-4">
                                <label className="block text-gray-700 font-bold mb-2" htmlFor="subCategory">
                                    Main category
                                </label>
                                <select value={maincategoryId}
                                    onChange={(e) => setMainCategoryId(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                                    <option value="">Select a main category</option>
                                    {mainCategories.map(category => (
                                        <option key={category.category_id} value={category.category_id} className='w-48 p-8' >{category.category_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-bold mb-2" htmlFor="subCategory">
                                    Sub category
                                </label>
                                <input
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="subCategory"
                                    type="text"
                                    placeholder="Enter subcategory"
                                    value={subCategoryValue}
                                    onChange={(e) => {
                                        setSubCategoryValue(e.target.value)
                                    }
                                    }
                                />
                            </div>
                            <button onClick={() => {
                                setSubCategory(false)
                                setUpdate(false)
                            }
                            }
                                className="bg-gray-100 text-gray-700 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
                                Cancel
                            </button>
                            {
                                isupdatesubCategory ? (
                                    <button onClick={UpdateSubCategory}
                                        className="bg-blue-500 hover:bg-blue-700 ml-5 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
                                        Update Subcategory
                                    </button>
                                ) : (
                                    <button onClick={AddSubCategory}
                                        className="bg-blue-500 hover:bg-blue-700 ml-5 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
                                        Add Subcategory
                                    </button>
                                )

                            }
                        </div>
                    ) : ""
                }
            </div>
            {/* below code consist of two button add category and sub category  */}
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
                            }}  >
                            Add Sub Category
                        </button>
                    </div>
                </div>
                {/*  */}
                {
                 
                        <div className="mt-4">
                            {mainCategories.map((category, index) => (
                                <div key={index} className="p-4 border-b border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <div className="font-bold">{category.category_name}</div>
                                        <div className="flex items-center space-x-2">
                                            <button onClick={() => editMainCategory(category.category_id, category.category_name)}
                                                className="px-2 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
                                            >
                                                Edit
                                            </button>
                                            <button onClick={() => deleteMainCategory(category.category_id)}
                                                className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                    {(
                                        <div className="mt-4">

                                            {subCategories.map((subcategory) => (
                                                <div key={subcategory.subCategory_id} className="ml-4 flex justify-between space-x-2">
                                                    {subcategory.category_id === category.category_id && (
                                                        <>
                                                            <div className="">{subcategory.subCategoryName}</div>
                                                            <div>
                                                                <button
                                                                    onClick={() => {
                                                                        setisUpdateSubCategory(true)
                                                                        setSubCategory(true)
                                                                        setSubCategoryValue(subcategory.subCategoryName)
                                                                        setMainCategoryId(subcategory.category_id)
                                                                        setSubCategoryId(subcategory.subCategory_id)
                                                                        scrolltop()
                                                                    }}
                                                                    className="px-2 py-1 rounded-md text-blue-300"
                                                                >
                                                                    <BiEditAlt />
                                                                </button>
                                                                <button onClick={() => deleteSubCategory(subcategory.subCategory_id)}
                                                                    className="px-2 py-1 rounded-md text-red-600"
                                                                >
                                                                    <RiDeleteBin6Line />
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ))}

                                        </div>
                                    )}
                                </div>
                                // />
                            ))}

                        </div>
                    
                }
            </div>
        </>
    );
};

export default Categories;