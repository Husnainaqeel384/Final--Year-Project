import {createReducer} from "@reduxjs/toolkit"

export const userReducer = createReducer({},{
    loginRequest:(state)=>{
        state.loading= true;
    },
    loginSuccess:(state,action)=>{
        state.loading=false;
        // state.token = action.payload.token;
        localStorage.setItem('token',action.payload.token)
        state.user = action.payload.user;
        state.message = action.payload.message;
    },
    loginFailed:(state,action)=>{
        state.loading=false;
        state.error = action.payload;
    },

    clearError:(state)=>{
        state.error = null;
    },
    clearMessage:(state)=>{
        state.message = null;
    }


})