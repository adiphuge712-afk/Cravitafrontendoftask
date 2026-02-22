
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
const Logout = async(navigate) => {
  const token=localStorage.getItem("token");
  if(token){
    localStorage.removeItem("token");
    window.location.href="/login";
  }
  };


export default Logout