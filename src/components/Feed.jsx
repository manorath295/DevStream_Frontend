import React, { useEffect, useState } from 'react'
import BASE_URL from '../utils/constant'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { addFeed } from '../utils/feedSlice'
import UserCard from './UserCard'

const Feed = () => {
  const dispatch = useDispatch();
  const feed = useSelector(store => store.feed);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeResults, setSwipeResults] = useState([]);

  const getFeed = async () => {
    if(feed) return
    try{
      const res = await axios.get(BASE_URL + "/feed", {
        withCredentials: true, 
      })
      console.log("hiiu")
      console.log(res?.data)
      dispatch(addFeed(res.data))
    }
    catch(err){
      console.log("by")
      console.log(err);
       if (err.response?.status === 400) {
      window.location.href = "/login"; // Or use next/router if using Next.js
    }
    }
  }

  useEffect(() => {
    getFeed()
  }, [])
const handleSwipe = async (direction, user) => {
   const result = {
      user: user,
      direction: direction,
      action: direction === 'right' ? 'Interested' : 'Ignored'
    };
    
  const status = direction === 'right' ? 'interested' : 'ignore';

  // optimistically update UI
 setSwipeResults(prev => [...prev, result]);
  setCurrentIndex(i => i + 1);

  try {
    const res = await axios.post(
      `${BASE_URL}/request/send/${status}/${user._id}`,
      {},
      { withCredentials: true }
    );
    console.log('Server response:', res.data);
  } catch (err) {
    console.error('Request failed:', err.response?.data || err.message);
  }
};


  console.log("Feed:", feed)
  console.log("Is array?", Array.isArray(feed))
  console.log("Current Index:", currentIndex)
  console.log("Swipe Results:", swipeResults)

  if (!feed || !Array.isArray(feed)) {
    return <div className="flex justify-center my-10">Loading...</div>;
  }

  if (currentIndex >= feed.length) {
    return (
      <div className="flex flex-col items-center justify-center my-10 space-y-4">
        <h2 className="text-2xl font-bold">No more profiles!</h2>
        <p className="text-gray-600">You've seen all available profiles.</p>
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Your Swipe History:</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {swipeResults.map((result, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 bg-base-200 rounded">
                <span className={`w-2 h-2 rounded-full ${result.direction === 'right' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span>{result.action} in {result.user.firstName} {result.user.lastName}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentUser = feed[currentIndex];
  const nextUser = feed[currentIndex + 1];

  return (
    <div className='flex justify-center my-10'>
      <div className="relative w-96 h-[600px]">
        {/* Stack of cards - render multiple cards for smooth transition */}
        {feed.slice(currentIndex, currentIndex + 3).map((user, index) => {
          const isCurrentCard = index === 0;
          const zIndex = 10 - index;
          const scale = 1 - (index * 0.05);
          const opacity = isCurrentCard ? 1 : 0.7;
          const translateY = index * 4;
          
          return (
            <div
              key={`${user._id}-${currentIndex + index}`}
              className="absolute top-0 left-0 w-full"
              style={{
                zIndex: zIndex,
                transform: `scale(${scale}) translateY(${translateY}px)`,
                opacity: opacity,
                pointerEvents: isCurrentCard ? 'auto' : 'none'
              }}
            >
              <UserCard 
                user={user} 
                onSwipe={isCurrentCard ? handleSwipe : () => {}} 
              />
            </div>
          );
        })}
        
        {/* Progress indicator */}
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 flex justify-center">
          <div className="flex space-x-1">
            {feed.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index < currentIndex 
                    ? 'bg-gray-400' 
                    : index === currentIndex 
                    ? 'bg-blue-500' 
                    : 'bg-gray-200'
                }`}
              ></div>
            ))}
          </div>
          <span className="ml-3 text-sm text-gray-600">
            {currentIndex + 1} of {feed.length}
          </span>
        </div>
      </div>
    </div>
  )
}

export default Feed