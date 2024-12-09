import { useRef } from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import "./STYLE/login.css";


const Login=()=>{

    const nameRef= useRef();
    const passwordRef= useRef();
    const nevigate= useNavigate();
    
    const loginUser=async(e)=>{
        e.preventDefault();
        const name= nameRef.current.value;
        const password= passwordRef.current.value;
        const user= await axios.post("https://pattekhelo.vercel.app/api/user/login", {name, password});
        if(user){
            alert("Login successfull");
            console.log(user.data.name);
            localStorage.setItem("user", user.data.name);
            nevigate("/");
        }else{
            alert("Login error")
        }
    }


    return(
        <>
        <form onSubmit={loginUser}>
            <input type="text" ref={nameRef} placeholder="Name..."/>
            <input type="password" ref={passwordRef} placeholder="Password..."/>
            <input type="Submit" />
        </form>
        </>
    )
}

export default Login;