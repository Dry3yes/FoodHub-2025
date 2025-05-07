import React, { useState } from "react";
import "./Menulist.css";
import MenuItem from "../Menuitem/Menuitem";
import PizzaExample from '../../assets/pizza.jpg'; 



const MenuList = () => {
  // State untuk menyimpan daftar menu
  const [menuData, setMenuData] = useState([
    {
      name: "Garlic Crust Vegetable Pizza",
      price: "148.000",
      rating: 4.7,
      image: PizzaExample,
      reviewsCount: 300,
    },
    {
      name: "Garlic Crust Vegetable Pizza",
      price: "148.000",
      rating: 4.7,
      image: PizzaExample,
      reviewsCount: 300,
    },
    {
      name: "Garlic Crust Vegetable Pizza",
      price: "148.000",
      rating: 4.7,
      image: PizzaExample,
      reviewsCount: 300,
    }
  ]);

  // State untuk input menu baru
  const [newMenuName, setNewMenuName] = useState("");
  const [newMenuPrice, setNewMenuPrice] = useState(""); // Tambahkan harga
  const [tempImage, setTempImage] = useState(null);

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      if (e.target.files.length > 0) {
        const file = e.target.files[0];
        setTempImage(URL.createObjectURL(file));
      }
    };
    input.click();
  };
  

  // Fungsi untuk menambahkan menu baru ke daftar
  const addMenu = () => {
    if (newMenuName.trim() === "" || newMenuPrice.trim() === "" || !tempImage) return; // Jangan tambah menu kosong

    const newMenu = {
      name: newMenuName,
      price: newMenuPrice || "0", // Bisa diubah jadi input dinamis juga
      rating: 0,
      image: tempImage, // Gambar default jika belum ada
      reviewsCount: 0,
    };

    setMenuData([...menuData, newMenu]); // Tambahkan menu baru ke state
    setNewMenuName(""); // Reset input setelah menambahkan
    setNewMenuPrice(""); // Reset harga
    setTempImage(null); // Reset gambar
  };

  return (
    <div className="menu-list">
      <h2>Your Menu</h2>
      <div className="menu-grid">
        {/* Form untuk menambah menu */}
        <div className="add-menu">
          <button onClick={handleImageUpload} className="plus-button">+</button>
          {tempImage && <img src={tempImage} alt="Preview" style={{ width: '100%', marginBottom: '10px' }} />}
          <input
            type="text"
            placeholder="Insert Your Menu's Name Here"
            value={newMenuName}
            onChange={(e) => setNewMenuName(e.target.value)}
          />
          
          {/* Bagian bawah: harga + save button */}
          <div className="menu-footer">
            <p>Rp.</p>
            <input
              type="number"
              className="price-input"
              placeholder="0"
              value={newMenuPrice}
              onChange={(e) => setNewMenuPrice(e.target.value)}
            />
            <button onClick={addMenu} className="save-button">Save</button>
          </div>
        </div>

        {/* Daftar menu */}
        {menuData.map((item, index) => (
         <MenuItem 
         key={index} 
         {...item} 
         onUpdate={(newName, newPrice) => {
           const updatedMenu = [...menuData];
           updatedMenu[index] = { ...updatedMenu[index], name: newName, price: newPrice };
           setMenuData(updatedMenu);
         }}
         onDelete={() => {
           const updatedMenu = menuData.filter((_, i) => i !== index);
           setMenuData(updatedMenu);
         }}
       />
        ))}
      </div>
    </div>
  );
};

export default MenuList;

