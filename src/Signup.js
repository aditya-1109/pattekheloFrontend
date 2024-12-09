import { useRef } from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";



const SignUp=()=>{

    const nameRef= useRef();
    const passwordRef= useRef();
    const pointRef= useRef();
    const numberRef= useRef();
    const nevigate= useNavigate();
    
    const signupUser=async(e)=>{
        e.preventDefault();
        const name= nameRef.current.value;
        const password= passwordRef.current.value;
        const points= pointRef.current.value;
        const number= numberRef.current.value;
        console.log(name+ number);
        const user= await axios.post("https://pattekhelo.vercel.app/api/user/signUp", {name, password, points, number});
        alert(user.data);
        nevigate("/");
    }


    return(
        <>
        <form onSubmit={signupUser}>
            <input type="text" ref={nameRef} placeholder="Name..."/>
            <input type="password" ref={passwordRef} placeholder="Password..."/>
            <input type="number" ref={pointRef} placeholder="Points" />
            <input type="number" ref={numberRef} placeholder="Number..." />
            <input type="Submit" value={"submit"} />
        </form>
        </>
    )
};

export default SignUp;