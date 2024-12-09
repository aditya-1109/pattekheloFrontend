import Navbar from "./navbar.js";
import { useNavigate } from "react-router-dom";
import "./STYLE/home.css";
import axios from "axios";

const Home=()=>{
    const nevigate= useNavigate();

    const userName= localStorage.getItem("user");

    const play=async(option)=>{
      if(userName){
      await axios.post("https://pattekhelo.vercel.app/api/user/setGameType", {name: userName, game: option});
      nevigate(`/play${option}`);
      }else{
        nevigate("/login");
      }
    }

    return(
    <>
    <div className="homeContainer">
        <Navbar />
        <div className="GameIconContainer">
          <div className="gameIcon">
          <img className="teen-patti-icon" onClick={()=>play("teen")} src="/images/teenPattiPoster.jpg" alt="teen-patti" />
          <p onClick={()=>play("teen")} className="teenPatti">Teen Patti</p>
          </div>
          <div className="gameIcon">
          <img className="teen-patti-icon"  src="/images/pocketCoverPoster.jpg" alt="teen-patti" />
          <div className="covering">Soon...</div>
          <p className="teenPatti">Poker</p>
          </div>
          <div className="gameIcon">
          <img className="teen-patti-icon"  src="/images/rummyCoverPoster.jpg" alt="teen-patti" />
          <div className="covering">Soon...</div>
          <p className="teenPatti">Rummy</p>
          </div>
        </div>
        <div className="footer">
          <p></p>
        </div>
    </div>
    </>
    )
};

export default Home;