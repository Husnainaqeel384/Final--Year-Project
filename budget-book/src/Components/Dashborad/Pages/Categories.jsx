import React, { useState } from 'react';
// import classNames from 'classnames';
import { BiEditAlt } from 'react-icons/bi'
import { RiDeleteBin6Line } from 'react-icons/ri'
const categories = [
    {
        id: 1,
        name: 'Main Category 1',
        subcategories: [
            { id: 1, name: 'Subcategory 1' },
            { id: 2, name: 'Subcategory 2' },
            { id: 3, name: 'Subcategory 3' },
        ],
    },
    {
        id: 2,
        name: 'Main Category 2',
        subcategories: [
            { id: 4, name: 'Subcategory 4' },
            { id: 5, name: 'Subcategory 5' },
        ],
    },
    {
        id: 3,
        name: 'Main Category 2',
        subcategories: [
            { id: 4, name: 'Subcategory 4' },
            { id: 5, name: 'Subcategory 5' },
        ],
    },
];

const Category = ({ category, onDelete, onEdit }) => {
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(category.name);

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

    return (
        <>

            <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <div className="font-bold">{category.name}</div>
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
                        {category.subcategories.map((subcategory) => (
                            <div key={subcategory.id} className="ml-4 flex justify-between space-x-2">
                                {subcategory.name}
                                <div>
                                    <button className="px-2 py-1  rounded-md  text-blue-300"> <BiEditAlt />  </button>
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
    const [categoriesData, setCategoriesData] = useState(categories);
    const [ismainCategory, setMainCategory] = useState(false)
    const [isSubCategory, setSubCategory] = useState(false)
    const handleDelete = (categoryId) => {
        const updatedCategories = categoriesData.filter(
            (category) => category.id !== categoryId
        );
        setCategoriesData(updatedCategories);
    };

    const handleEdit = (categoryId, name) => {
        const updatedCategories = categoriesData.map((category) => {
            if (category.id === categoryId) {
                return { ...category, name };
            }
            return category;
        });
        setCategoriesData(updatedCategories);
    };

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
                    {categoriesData.map((category) => (
                        <Category


                            key={category.id}
                            category={category}
                            onDelete={handleDelete}

                            onEdit={handleEdit}
                        />
                    ))}
                </div>
            </div>
        </>
    );
};

export default Categories;