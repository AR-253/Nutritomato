import React, { useContext } from 'react';
import './RecommendedFood.css';
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';

const RecommendedFood = () => {
    const { recommendedItems, goal } = useContext(StoreContext);

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
                autoPlay={false}
                keyBoardControl={true}
                containerClass="carousel-container"
                itemClass="carousel-item-padding-40-px"
                slidesToSlide={1}
            >
                {recommendedItems.map((item, index) => (
                    <div key={index} style={{ padding: '0 10px' }}>
                        <FoodItem 
                            id={item._id} 
                            name={item.name} 
                            description={item.description} 
                            price={item.price} 
                            image={item.image} 
                            calories={item.calories} 
                            protein={item.protein} 
                            carbs={item.carbs} 
                            fats={item.fats} 
                            weight={item.weight} 
                            ingredients={item.ingredients} 
                            category={item.category} 
                        />
                    </div>
                ))}
            </Carousel>
        </div>
    );
};

export default RecommendedFood;
