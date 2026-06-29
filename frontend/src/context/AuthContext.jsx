import { createContext, useContext, useState, useEffect } from 'react';
import api, { authAPI } from '../services/api'; // ← Interceptor bind karne ke liye api instance import kiya

export const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [shopInfo, setShopInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Nayi suspension state handle karne ke liye add ki 🚫
  const [suspendedInfo, setSuspendedInfo] = useState(null);

  // Theme states
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  
  // Dummy language placeholder options (Provider value crash se bachne ke liye)
  const [lang, setLang] = useState('en');
  const toggleLang = () => setLang((l) => (l === 'en' ? 'hi' : 'en'));

  // Existing localstorage data loads
  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    const storedShop = localStorage.getItem('shopInfo');
    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedShop) setShopInfo(JSON.parse(storedShop));
    setLoading(false);
  }, []);

  // Axios response interceptor for global 403 Suspended handling
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 403 && error.response?.data?.suspended) {
          // Backend se aane wali suspension details state me save karo
          setSuspendedInfo({
            reason: error.response.data.reason,
            contact: error.response.data.contact,
            paymentDueDate: error.response.data.paymentDueDate,
          });
        }
        return Promise.reject(error);
      }
    );

    // Clean up interceptor on unmount
    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  // Theme change ko DOM attributes ke saath sync karne ke liye useEffect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Theme toggle function
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const login = async (email, password) => {
    try {
      setSuspendedInfo(null); // Purani suspension detail reset karo login attempt par
      const { data } = await authAPI.login({ email, password });
      localStorage.setItem('userInfo', JSON.stringify(data));
      setUser(data);

      if (data.shopId && data.shopName) {
        const freshShop = {
          id: data.shopId,
          name: data.shopName,
          shopCode: data.shopCode || null,
        };
        localStorage.setItem('shopInfo', JSON.stringify(freshShop));
        setShopInfo(freshShop);
      }

      if (data.role === 'superadmin') {
        localStorage.removeItem('shopInfo');
        setShopInfo(null);
      }

      return data;
    } catch (error) {
      // Agar direct login route par 403 interceptor skip hua, to yahan se track hoga
      if (error.response?.status === 403 && error.response?.data?.suspended) {
        setSuspendedInfo({
          reason: error.response.data.reason,
          contact: error.response.data.contact,
          paymentDueDate: error.response.data.paymentDueDate,
        });
      }
      throw error; // Component inline error processing handle karne ke liye throw kiya
    }
  };

  const register = async (name, email, password, role, shopCode) => {
    const { data } = await authAPI.register({ 
      name, email, password, role, shopCode 
    });

    if (role === 'customer') {
      localStorage.setItem('userInfo', JSON.stringify(data));
      setUser(data);

      if (data.shopId && data.shopName) {
        const freshShop = {
          id: data.shopId,
          name: data.shopName,
          shopCode: shopCode,
        };
        localStorage.setItem('shopInfo', JSON.stringify(freshShop));
        setShopInfo(freshShop);
      }
    }
    return data;
  };

  const saveShopInfo = (shop) => {
    localStorage.setItem('shopInfo', JSON.stringify(shop));
    setShopInfo(shop);
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('shopInfo');
    localStorage.removeItem('suspendedInfo'); // ← localstorage se data clear kiya 🧹
    setUser(null);
    setShopInfo(null);
    setSuspendedInfo(null); // Clear suspension data state
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      shopInfo, 
      loading, 
      login, 
      register, 
      logout, 
      saveShopInfo,
      theme,        
      toggleTheme,
      lang,         // Provider value me explicit include kiya
      toggleLang,   // Provider value me explicit include kiya
      suspendedInfo,   // Nayi custom state variable expose ki
      setSuspendedInfo // State setter dispatch function expose kiya
    }}>
      {children}
    </AuthContext.Provider>
  );
};