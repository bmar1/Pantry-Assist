// GroceryListPage.js
import React from "react";
import { useNavigate } from "react-router-dom";

const GroceryListPage = () => {
    const navigate = useNavigate();

    // Sample grocery list data
    const groceryList = [
        { name: "Bananas", price: 1.29, link: "https://example.com/bananas" },
        { name: "Almond Milk", price: 3.49, link: "https://example.com/almond-milk" },
        { name: "Eggs", price: 2.99, link: "https://example.com/eggs" },
        { name: "Spinach", price: 4.99, link: "https://example.com/spinach" },
        { name: "Oats", price: 2.49, link: "https://example.com/oats" },
    ];

    // Calculate total
    const totalPrice = groceryList.reduce((sum, item) => sum + item.price, 0);

    return (
        <div className="min-h-screen bg-[#5a9f5a] flex justify-center items-start p-20">
            <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-6 border border-[#C7D6C1]">
                {/* Back Button */}
                <button
                    onClick={() => navigate("/dashboard")}
                    className="mb-4 px-4 py-2 bg-[#7A9E7E] text-white rounded-lg hover:bg-[#668B67]"
                >
                    Back to Home
                </button>

                <h1 className="text-3xl font-bold mb-6 text-[#7A9E7E]">Grocery List</h1>

                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-[#DCE5DC]">
                            <th className="py-2 text-[#5C7A62]">Item</th>
                            <th className="py-2 text-[#5C7A62]">Price</th>
                            <th className="py-2 text-[#5C7A62]">Link</th>
                        </tr>
                    </thead>
                    <tbody>
                        {groceryList.map((item, index) => (
                            <tr key={index} className="border-b border-[#E3E8E3] hover:bg-[#F0F5F0]">
                                <td className="py-2 text-[#4C5E4C]">{item.name}</td>
                                <td className="py-2 text-[#4C5E4C]">${item.price.toFixed(2)}</td>
                                <td className="py-2">
                                    <a
                                        href={item.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#7A9E7E] hover:underline"
                                    >
                                        Buy
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="mt-4 text-right font-semibold text-[#5C7A62]">
                    Total: ${totalPrice.toFixed(2)}
                </div>
            </div>
        </div>
    );
};

export default GroceryListPage;
