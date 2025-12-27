import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingScreen from './LoadingScreen';

const GroceryListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize state directly from location, or as an empty array.
  const [groceryList, setGroceryList] = useState(() => location.state?.grocery || []);
  const [isLoading, setIsLoading] = useState(() => !location.state?.grocery);

  const openNewTab = (url) => {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (newWindow) {
      newWindow.opener = null;
    }
  };

  const handleBuyAll = () => {
    const baseUrl = 'https://affil.walmart.com/cart/addToCart?items=';
    const itemsParams = groceryList
      .map((item, index) => {
        if (!item.productUrl) {
          console.warn(`Item #${index} has no product_url`);
          return null;
        }

        // Matches "items=" OR "items%3D" to find ID
        const idMatch = item.productUrl.match(/items(?:=|%3D)(\d+)/);

        if (idMatch && idMatch[1]) {
          return `${idMatch[1]}|1`; //return the id and quantity of 1
        }
        return null;
      })
      .filter(Boolean)
      .join(',');

    if (itemsParams) {
      const finalUrl = `${baseUrl}${itemsParams}`;
      console.log('Generated Final URL:', finalUrl);
      openNewTab(finalUrl);
    } else {
      console.error('Failed to generate any IDs. Check console logs above.');
      alert('Could not find any valid items to add.');
    }
  };

  useEffect(() => {
    if (groceryList === null) {
      navigate('/LoadingScreen', { state: { page: 'grocery' } });
    }
  }, [groceryList, navigate]);

  useEffect(() => {
    const loadGrocery = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:8080/api/meals/groceryList`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();

          const seenNames = new Set();
          const uniqueList = data.filter((item) => {
            const isDuplicate = seenNames.has(item.name);
            seenNames.add(item.name);
            return !isDuplicate;
          });

          setGroceryList(uniqueList);
        } else {
          console.error('Failed to load grocery list:', response.status);
          setGroceryList([]);
        }
      } catch (error) {
        console.error('Error loading grocery list:', error);
        setGroceryList([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (!location.state?.grocery && (!groceryList || groceryList.length === 0)) {
      loadGrocery();
    }
  }, [location.state?.grocery]);

  // Handle case where no grocery data is available after trying to load.
  if (!groceryList || groceryList.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#6d9851] to-[#5A7A4D] flex justify-center items-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Your grocery list is empty.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-[#7A9E7E] text-white rounded-lg hover:bg-[#668B67]"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Calculate total price
  const totalPrice = groceryList.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  const itemCount = groceryList.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6d9851] via-[#5A7A4D] to-[#4a6340] p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/20 backdrop-blur-md p-3 rounded-xl">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-1">Grocery List</h1>
                <p className="text-white/80 text-sm">{itemCount} items • Ready to shop</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-white/30 transition-all duration-300 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="font-semibold">Back</span>
          </button>
        </div>

        {/* Total Card */}
        <div className="bg-white rounded-2xl p-6 shadow-xl max-w-7xl mb-10">
          <div className="flex items-center">
            <div>
              <p className="text-sm text-gray-500 mb-1">Estimated Total</p>
              <p className="text-4xl font-bold text-[#6d9851]">${totalPrice.toFixed(2)}</p>
            </div>

            <button
              className="px-6 py-3 -mb-5 ml-12 bg-[#90c1e0] text-white rounded-xl font-bold text-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
              onClick={handleBuyAll}
            >
              Proceed to Checkout
            </button>

            <div className="ml-auto bg-gradient-to-br from-[#6d9851] to-[#5A7A4D] p-4 rounded-xl">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Grocery Items List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">Shopping Items</h2>
          </div>

          <div className="divide-y divide-gray-100">
            {groceryList.map((item, index) => (
              <div key={index} className="group p-6 hover:bg-gray-50 transition-all duration-300">
                <div className="flex items-center gap-6">
                  {/* Checkbox */}
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 rounded-lg border-2 border-gray-300 group-hover:border-[#90c1e0] transition-colors cursor-pointer flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-[#6d9851] opacity-0 group-hover:opacity-100 transition-opacity"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Image */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200 group-hover:border-[#90c1e0] transition-colors">
                      <img
                        src={item.imageUrl || '/icons/groceryIcon.png'}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  </div>

                  {/* Item Info */}
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-[#90c1e0] transition-colors">
                      {item.name || 'Unnamed Item'}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      {item.servingsPerContainer || 'N/A'}
                    </p>
                  </div>

                  {/* Price & Action */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-2xl font-bold text-black mb-3">
                      ${(item.totalPrice || 0).toFixed(2)}
                    </p>
                    <a
                      href={item.productUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2 bg-[#90c1e0] text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      Buy Now
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer with Total */}
          <div className="p-6 bg-gradient-to-r from-[#6d9851] to-[#5A7A4D]">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <p className="text-sm opacity-90 mb-1">Ready to checkout?</p>
                <p className="text-lg font-semibold">Review your items above</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/80 mb-1">Total Amount</p>
                <p className="text-4xl font-bold text-white">${totalPrice.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroceryListPage;
