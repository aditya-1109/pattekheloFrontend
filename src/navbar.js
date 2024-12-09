import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./STYLE/navbar.css";

const Navbar = () => {

    const [user, setUser] = useState(null);
    const nevigate = useNavigate();
    const userName = localStorage.getItem("user");


    useEffect(() => {

        const getUser = async () => {
            if(userName){
                console.log(userName);
            const users = await axios.post("https://pattekhelo.vercel.app/api/user/getUser", { name: userName });
            if (users) {
                setUser(users.data);
            }
            }
        }

        getUser();

    }, [userName]);


    const login = (e) => {
        nevigate("/login");
    }

    const logout = () => {
        localStorage.removeItem("user");
        nevigate("/login");
    }

    return (
        <>
            <div className="header">
                <h1 className="website-name">Website</h1>

                {user ? <div className="avatarcontainer">
                    <button onClick={logout} className="logButton">Logout</button>
                    <img className="avatar" src={`https://api.dicebear.com/6.x/avataaars/svg?seed=${user.name}`} alt="avatar" />
                </div> : <div className="avatarcontainer">
                    <button onClick={login} className="logButton">Login</button>
                    <img className="avatar" src={`https://api.dicebear.com/6.x/avataaars/svg?seed=default`} alt="avatar" />
                </div>}
            </div>

        </>
    )
}

export default Navbar;