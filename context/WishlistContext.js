"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { parseCookies } from "nookies";
import toast from "react-hot-toast";
// Create a context for the Wishlist
const WishlistContext = createContext();

// Create a custom hook to access the Wishlist context
export const useWishlist = () => useContext(WishlistContext);

// Wishlist provider component
export function WishlistProvider({ children }) {
  const { token } = parseCookies();
  const [WishlistItems, setWishlistItems] = useState([]);

  // Load Wishlist items from local storage when the component mounts
  useEffect(() => {
    if (token) {
      (async () => {
        try {
          const items = await fetch("api/wishlist", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (items.ok) {
            const data = await items.json();
            setWishlistItems(data);
            console.log("Inside context wishlistitems", data);
          } else {
            console.error("Error while fetching the cart: " + items.statusText);
          }
        } catch (error) {
          console.error(
            "An unexpected error occurred while fetching the wishlist: " +
              error.message
          );
        }
      })();
    }
  }, [token]);

  // useEffect(() => {
  //   const storedWishlistItems = localStorage.getItem("WishlistItems");
  //   if (storedWishlistItems) {
  //     setWishlistItems(JSON.parse(storedWishlistItems));
  //   }
  // }, []);
  const addToWishlist = async (item) => {
    try {
      const existingItemIndex = WishlistItems.findIndex(
        (wishlistItem) => wishlistItem.id === item.id
      );
      if (existingItemIndex !== -1) {

      } else {
        
        WishlistItems.push(item);
      }

      const requestData = {
        items: WishlistItems,
      };

      const res = await fetch("api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (res.ok) {
        toast.success("Book Added To Wishlist successfully");
        setWishlistItems(WishlistItems);
        // Update local storage
      } else {
        console.error("Error while adding item to Wishlist.");
      }
    } catch (error) {
      console.error("Error while adding item to Wishlist", error.message);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const res = await fetch("api/wishlist", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: productId,
        }),
      });

      if (res.status === 200) {
        const res2 = await res.json();
        console.log("After removing from Wishlist", res2);
        setWishlistItems(res2.items);
        settotal(res2.total); // Update Wishlist items specifically
        console.log("After removing from Wishlist itemsssss", res2.items);
      } else {
        console.log(
          "Error during removing data from Wishlist:",
          res.statusText
        );
      }
    } catch (error) {
      console.log("Error during removing data from Wishlist:", error.message);
    }
  };
  

  return (
    <WishlistContext.Provider
      value={{
        WishlistItems,
        setWishlistItems,
        addToWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}
