import './responsive.css';
import React, { useEffect, useContext } from 'react';
import { BrowserRouter, Switch, Route, useLocation } from 'react-router-dom';
import Navbar from './components/navbar/Navbar.js';
import Home from './pages/Home/Home.js';
import Cart from './pages/Cart/Cart.jsx';
import PlaceOrder from './pages/PlaceOrder/PlaceOrder.jsx';
import Footer from './components/Footer/Footer.jsx';
import LoginPop from './components/LoginPop/LoginPop.jsx';
import DietPlanner from './pages/DietPlanner/DietPlanner.jsx';
import AIPlanner from './pages/AIPlanner/AIPlanner.jsx';
import MyOrders from './pages/MyOrders/MyOrders.jsx';
import History from './pages/History/History.jsx';
import ConsumptionReminder from './components/ConsumptionReminder/ConsumptionReminder.jsx';
import WelcomePopup from './components/WelcomePopup/WelcomePopup.jsx';
import { StoreContext } from './context/StoreContext';

// SmartScanner removed as it is now integrated into AIPlanner
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App = () => {
  const { showLogin, setShowLogin } = useContext(StoreContext);
  const [welcome, setWelcome] = React.useState({ show: false, name: '' });

  return (
    <>
      <BrowserRouter>
        <ScrollToTop />
        
        {welcome.show && (
          <WelcomePopup 
            name={welcome.name} 
            setShow={(val) => setWelcome(prev => ({ ...prev, show: val }))} 
          />
        )}
        
        {showLogin && <LoginPop setWelcome={setWelcome} />}
        
        <Navbar />
        
        <div className='app'>
          <ConsumptionReminder />
          
          <Switch>
            <Route path="/placeorder" component={PlaceOrder} />
            <Route path="/cart" component={Cart} />
            <Route path="/diet-planner" component={DietPlanner} />
            <Route path="/ai-planner" component={AIPlanner} />
            
            
            <Route path="/history" component={History} />
            <Route path="/myorders" component={MyOrders} />
            <Route exact path="/" component={Home} />
            
            {/* 404 Page - Ye hamesha sab se niche hona chahiye */}
            <Route path="*" render={() => <div style={{padding: "100px", textAlign: "center"}}><h2>404 - Page Not Found</h2></div>} />
          </Switch>
        </div>
        
        {/* Conditional Footer - Hide on certain pages */}
        <Route render={({ location }) => {
          const hideFooterPages = ['/diet-planner', '/ai-planner', '/cart', '/myorders', '/history', '/placeorder'];
          return !hideFooterPages.includes(location.pathname) ? <Footer /> : null;
        }} />
      </BrowserRouter>
    </>
  );
};

export default App;