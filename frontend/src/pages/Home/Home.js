import React, { useState } from 'react';
import FoodDisplay from '../../components/fooddisplay/FoodDisplay';
import './Home.css';
import Header from '../../components/Header/Header';
import ExploreMenu from '../../components/Exploremenu/ExploreMenu';
import RecommendedFood from '../../components/RecommendedFood/RecommendedFood';
import AppDownload from '../../components/AppDownload/AppDownload';

const Home = () => {
  const [category, setCategory] = useState("All");

  return (
    <div className="home-container"> 
      <Header />
      <ExploreMenu category={category} setCategory={setCategory} />
      <div className="home-section-wrapper">
         <RecommendedFood />
         <FoodDisplay category={category} />
      </div>
      <AppDownload />
    </div>
  );
};

export default Home;
