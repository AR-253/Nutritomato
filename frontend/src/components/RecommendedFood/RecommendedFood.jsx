
import React, { useContext, useEffect, useState } from 'react';
import './RecommendedFood.css';
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';
import axios from 'axios';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';

const RecommendedFood = () => {
    const { food_list, url, token } = useContext(StoreContext);
    const [goal, setGoal] = useState(null);
    const [recommendedItems, setRecommendedItems] = useState([]);

    useEffect(() => {
        if (token) {
            const fetchDietPlan = async () => {
                try {
                    const response = await axios.post(url + "/api/diet/get", {}, { headers: { token } });
                    if (response.data.success) {
                        setGoal(response.data.data.userInfo.goal);
                    }
                } catch (error) {
                    console.error("Error fetching diet plan:", error);
                }
            };
            fetchDietPlan();
        }
    }, [token, url]);

    useEffect(() => {
        if (!goal || food_list.length === 0) return;

        let filtered = [];

        if (goal === 'Lose') {
            filtered = food_list.filter(item => item.calories && item.calories <= 400).sort((a, b) => a.calories - b.calories);
        } else if (goal === 'Gain') {
            filtered = food_list.filter(item => item.calories && item.calories >= 500).sort((a, b) => b.calories - a.calories);
        } else {
            filtered = food_list.filter(item => item.calories && item.calories > 300 && item.calories < 600);
        }
        setRecommendedItems(filtered.slice(0, 10)); // Top 10
    }, [goal, food_list]);

    const responsive = {
        superLargeDesktop: {
            breakpoint: { max: 4000, min: 3000 },
            items: 5
        },
        desktop: {
            breakpoint: { max: 3000, min: 1024 },
            items: 3
        },
        tablet: {
            breakpoint: { max: 1024, min: 464 },
            items: 2
        },
        mobile: {
            breakpoint: { max: 464, min: 0 },
            items: 1
        }
    };

    if (!goal || recommendedItems.length === 0) return null;

    return (
        <div className='recommended-food' id='recommended-food'>
            <h2>Recommended for Your {goal} Goal</h2>
            <Carousel
                responsive={responsive}
                infinite={true}
                autoPlay={false} // User prefers manual control
                keyBoardControl={true}
                containerClass="carousel-container"
                itemClass="carousel-item-padding-40-px"
                slidesToSlide={1}
            >
                {recommendedItems.map((item, index) => {
                    // Wrap item in a div with padding to ensure spacing
                    return (
                        <div key={index} style={{ padding: '0 10px' }}>
                            <FoodItem id={item._id} name={item.name} description={item.description} price={item.price} image={item.image} calories={item.calories} protein={item.protein} carbs={item.carbs} fats={item.fats} />
                        </div>
                    )
                })}
            </Carousel>
        </div>
    );
};

export default RecommendedFood;
