import {createAsyncThunk , createSlice} from '@reduxjs/toolkit'

const initialState={
    msg:"",
    user:"",
    token:"",
    loading:false,
    error:""
}

// const signup = createAsyncThunk('signup',async()=>{

// } )

const authSlice = createSlice({
    name:'user',
    initialState,
    reducers:{
        
    },
    extraReducers:{

    }
})

export default authSlice.reducer 