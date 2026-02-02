import React from "react";
import Home from "./Home";           // your collections grid
import "./ShopFish.css";

export default function ShopFish() {
  return (
    <>
      <div className="shop-wrap">
        <h1 className="shop-title"></h1>

        <Home />
      </div>
    </>
  );
}
