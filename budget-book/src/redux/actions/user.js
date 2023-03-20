import { server } from "../../store";
import Axios from "axios";

export const LoginUser = (Email, Password) => async (dispatch) => {
    try {
        dispatch({ type: "loginRequest" });
        const {data} = await Axios.post(`${server}/login`,
         { Email, Password },
         {
            headers:{
                'Accept': 'application/json',
                'Content-type':'application/json'
            }
         });

         dispatch({ type: "loginSuccess" ,payload:data});
        //  localStorage.setItem('token',data.token)
        } catch (error) {
        
        dispatch({ type: "loginFailed",payload:error.response.data.message});
    }

}