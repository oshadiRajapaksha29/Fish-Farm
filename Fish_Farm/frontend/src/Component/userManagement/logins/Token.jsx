import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const Token = () => {
  const navigate = useNavigate();
  const [decodedToken, setDecodedToken] = useState(null);

  useEffect(() => {
    const tok = Cookies.get('token');
    console.log(tok)

    // if (!tok) {
    //   navigate('/login ');
    //   return;
    // }

    try {
      const token = jwtDecode(tok);
      setDecodedToken(token);
    } catch (err) {
      console.error('Invalid token:', err);
      //navigate('/login'); // redirect if token is invalid
    }
  }, [navigate]);

  return decodedToken;
};

export default Token;
