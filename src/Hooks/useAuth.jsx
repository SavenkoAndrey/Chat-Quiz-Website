import { useState, useEffect } from 'react';

function useAuth() {
  // const userToken = localStorage.getItem('username');
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('userId') || sessionStorage.getItem('userId'));
  
  useEffect(() => {
    const storageChange = () => {
      setIsAuthenticated(!!localStorage.getItem('userId') || sessionStorage.getItem('userId'));
    };

    // add EventListener for storage 
    window.addEventListener('storage', storageChange);

    // Clean EventListener when unmounting a component 
    return () => {
      window.removeEventListener('storage', storageChange);
    };
  }, []);

  return isAuthenticated;
}

export default useAuth;
