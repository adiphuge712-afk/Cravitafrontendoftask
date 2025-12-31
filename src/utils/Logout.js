
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
const Logout = async(navigate) => {
  const navigates=useNavigate();
    try {
      await axios.post(
        "http://localhost:8056/logout",{}
      );
      navigates("/login");
    } catch (error) {
      console.log(error);
    }
  };


export default Logout